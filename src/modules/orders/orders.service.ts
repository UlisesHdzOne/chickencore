import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { SchedulingValidatorService } from '../scheduling/scheduling-validator.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { OrderStatus, OrderType, Prisma } from '@prisma/client';
import { addDays, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private productsService: ProductsService,
    private schedulingValidatorService: SchedulingValidatorService,
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    // Validar que el carrito no esté vacío
    await this.cartService.validateCartForCheckout(userId);

    // Obtener carrito del usuario
    const cart = await this.cartService.getCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // Validar agendamiento si es necesario
    if (createOrderDto.type === OrderType.SCHEDULED) {
      if (!createOrderDto.scheduledFor) {
        throw new BadRequestException('La fecha de entrega es requerida para pedidos agendados');
      }

      const cartItems = cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        productName: item.product.name,
        price: item.product.price.toNumber(),
      }));

      const validation = await this.schedulingValidatorService.validateSchedulingRequest(
        createOrderDto.scheduledFor,
        cartItems,
      );

      if (!validation.canSchedule) {
        throw new BadRequestException(validation.reason);
      }
    }

    // Calcular totales
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.product.price.toNumber() * item.quantity);
    }, 0);

    const tax = subtotal * 0.16; // 16% IVA
    const total = subtotal + tax;

    // Crear pedido en una transacción
    return this.prisma.$transaction(async (tx) => {
      // Crear el pedido
      const order = await tx.order.create({
        data: {
          userId,
          type: createOrderDto.type,
          subtotal,
          tax,
          total,
          deliveryType: createOrderDto.deliveryType,
          scheduledFor: createOrderDto.scheduledFor ? new Date(createOrderDto.scheduledFor) : null,
          addressId: createOrderDto.addressId,
          notes: createOrderDto.notes,
          paymentMethod: createOrderDto.paymentMethod,
        },
      });

      // Crear los items del pedido
      for (const cartItem of cart.items) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: cartItem.product.id,
            quantity: cartItem.quantity,
            unitPrice: cartItem.product.price,
          },
        });

        // Crear las selecciones de regalos
        if (cartItem.selectedGifts && cartItem.selectedGifts.length > 0) {
          await tx.orderItemGiftSelection.createMany({
            data: cartItem.selectedGifts.map(gift => ({
              orderItemId: orderItem.id,
              giftId: gift.giftId,
              quantity: gift.quantity,
            })),
          });
        }

        // Actualizar stock del producto
        await this.productsService.updateStock(
          cartItem.product.id,
          cartItem.quantity,
          'OUT',
          `Pedido #${order.id}`,
        );
      }

      // Registrar el cambio de estado inicial
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PENDING,
          changedBy: userId,
          notes: 'Pedido creado',
        },
      });

      // Limpiar carrito
      await this.cartService.clearCart(userId);

      return order;
    });
  }

  async findAll(params?: {
    userId?: number;
    status?: OrderStatus;
    type?: OrderType;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      userId,
      status,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = params || {};

    const where: Prisma.OrderWhereInput = {
      ...(userId && { userId }),
      ...(status && { status }),
      ...(type && { type }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
          address: true,
          items: {
            include: {
              product: true,
              selectedGifts: {
                include: {
                  gift: true,
                },
              },
            },
          },
          statusHistory: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { changedAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        address: true,
        items: {
          include: {
            product: true,
            selectedGifts: {
              include: {
                gift: true,
              },
            },
          },
        },
        statusHistory: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return order;
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto, changedBy: number) {
    const order = await this.findOne(id);

    // Validar transición de estado
    this.validateStatusTransition(order.status, updateOrderStatusDto.status);

    return this.prisma.$transaction(async (tx) => {
      // Actualizar el estado del pedido
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: updateOrderStatusDto.status,
          ...(updateOrderStatusDto.status === OrderStatus.DELIVERED && {
            paidAt: new Date(),
            isPaid: true,
          }),
        },
      });

      // Registrar el cambio en el historial
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: updateOrderStatusDto.status,
          changedBy,
          notes: updateOrderStatusDto.notes,
        },
      });

      return updatedOrder;
    });
  }

  async cancelOrder(id: number, cancelledBy: number, reason?: string) {
    const order = await this.findOne(id);

    // Solo se pueden cancelar pedidos pendientes o en preparación
    if (![OrderStatus.PENDING, OrderStatus.IN_PREPARATION].includes(order.status)) {
      throw new BadRequestException('Solo se pueden cancelar pedidos pendientes o en preparación');
    }

    return this.prisma.$transaction(async (tx) => {
      // Devolver stock de los productos
      for (const item of order.items) {
        await this.productsService.updateStock(
          item.product.id,
          item.quantity,
          'IN',
          `Cancelación del pedido #${order.id}`,
        );
      }

      // Actualizar estado del pedido
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      });

      // Registrar cancelación en el historial
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: OrderStatus.CANCELLED,
          changedBy: cancelledBy,
          notes: reason || 'Pedido cancelado',
        },
      });

      return updatedOrder;
    });
  }

  async getOrdersByUser(userId: number, params?: {
    status?: OrderStatus;
    type?: OrderType;
    page?: number;
    limit?: number;
  }) {
    return this.findAll({
      userId,
      ...params,
    });
  }

  async getTodaysOrders() {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    return this.prisma.order.findMany({
      where: {
        OR: [
          // Pedidos creados hoy
          {
            createdAt: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
          // Pedidos agendados para hoy
          {
            scheduledFor: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: [
        { scheduledFor: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async getScheduledOrders(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfTargetDate = startOfDay(targetDate);
    const endOfTargetDate = endOfDay(targetDate);

    return this.prisma.order.findMany({
      where: {
        type: OrderType.SCHEDULED,
        scheduledFor: {
          gte: startOfTargetDate,
          lte: endOfTargetDate,
        },
        status: {
          not: OrderStatus.CANCELLED,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  async getOrderStats(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : startOfDay(addDays(new Date(), -30));
    const end = endDate ? new Date(endDate) : endOfDay(new Date());

    const [totalOrders, totalSales, ordersByStatus, ordersByType] = await Promise.all([
      this.prisma.order.count({
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { total: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: start, lte: end },
        },
        _count: { status: true },
      }),
      this.prisma.order.groupBy({
        by: ['type'],
        where: {
          createdAt: { gte: start, lte: end },
        },
        _count: { type: true },
      }),
    ]);

    return {
      totalOrders,
      totalSales: totalSales._sum.total || 0,
      averageOrderValue: totalOrders > 0 ? (totalSales._sum.total?.toNumber() || 0) / totalOrders : 0,
      ordersByStatus,
      ordersByType,
    };
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED],
      [OrderStatus.IN_PREPARATION]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.READY_FOR_DELIVERY, OrderStatus.CANCELLED],
      [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.READY_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [], // Estado final
      [OrderStatus.CANCELLED]: [], // Estado final
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${currentStatus} a ${newStatus}`
      );
    }
  }
}