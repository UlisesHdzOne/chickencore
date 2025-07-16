import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { gifts, ...productData } = createProductDto;

    // Verificar si ya existe un producto con el mismo nombre y presentación
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        name_presentation: {
          name: productData.name,
          presentation: productData.presentation,
        },
      },
    });

    if (existingProduct) {
      throw new BadRequestException(
        `Ya existe un producto con el nombre "${productData.name}" y presentación "${productData.presentation}"`
      );
    }

    // Validar que los regalos existan si se proporcionan
    if (gifts && gifts.length > 0) {
      const giftIds = gifts.map(gift => gift.giftId);
      const existingGifts = await this.prisma.product.findMany({
        where: { id: { in: giftIds } },
        select: { id: true },
      });

      if (existingGifts.length !== giftIds.length) {
        throw new BadRequestException('Uno o más productos regalo no existen');
      }
    }

    return this.prisma.product.create({
      data: {
        ...productData,
        hasGifts: gifts && gifts.length > 0,
        gifts: gifts && gifts.length > 0 ? {
          create: gifts.map(gift => ({
            giftId: gift.giftId,
            quantity: gift.quantity,
          })),
        } : undefined,
      },
      include: {
        category: true,
        gifts: {
          include: {
            gift: {
              select: {
                id: true,
                name: true,
                presentation: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(params?: {
    categoryId?: number;
    isActive?: boolean;
    hasGifts?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      categoryId,
      isActive = true,
      hasGifts,
      search,
      page = 1,
      limit = 10,
    } = params || {};

    const where: Prisma.ProductWhereInput = {
      isActive,
      ...(categoryId && { categoryId }),
      ...(hasGifts !== undefined && { hasGifts }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { presentation: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          gifts: {
            include: {
              gift: {
                select: {
                  id: true,
                  name: true,
                  presentation: true,
                  price: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: [
          { category: { sortOrder: 'asc' } },
          { name: 'asc' },
          { presentation: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        gifts: {
          include: {
            gift: {
              select: {
                id: true,
                name: true,
                presentation: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { gifts, ...productData } = updateProductDto;

    // Verificar que el producto existe
    const existingProduct = await this.findOne(id);

    // Si se actualiza nombre o presentación, verificar unicidad
    if (productData.name || productData.presentation) {
      const checkProduct = await this.prisma.product.findUnique({
        where: {
          name_presentation: {
            name: productData.name || existingProduct.name,
            presentation: productData.presentation || existingProduct.presentation,
          },
        },
      });

      if (checkProduct && checkProduct.id !== id) {
        throw new BadRequestException(
          `Ya existe un producto con el nombre "${productData.name || existingProduct.name}" y presentación "${productData.presentation || existingProduct.presentation}"`
        );
      }
    }

    // Validar regalos si se proporcionan
    if (gifts && gifts.length > 0) {
      const giftIds = gifts.map(gift => gift.giftId);
      const existingGifts = await this.prisma.product.findMany({
        where: { id: { in: giftIds } },
        select: { id: true },
      });

      if (existingGifts.length !== giftIds.length) {
        throw new BadRequestException('Uno o más productos regalo no existen');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(gifts !== undefined && {
          hasGifts: gifts.length > 0,
          gifts: {
            deleteMany: {},
            create: gifts.map(gift => ({
              giftId: gift.giftId,
              quantity: gift.quantity,
            })),
          },
        }),
      },
      include: {
        category: true,
        gifts: {
          include: {
            gift: {
              select: {
                id: true,
                name: true,
                presentation: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number) {
    // Verificar que el producto existe
    await this.findOne(id);

    // Verificar que no esté siendo usado en carritos o pedidos activos
    const [cartItems, orderItems] = await Promise.all([
      this.prisma.cartItem.count({ where: { productId: id } }),
      this.prisma.orderItem.count({
        where: {
          productId: id,
          order: {
            status: {
              in: ['PENDING', 'IN_PREPARATION', 'READY_FOR_PICKUP', 'READY_FOR_DELIVERY'],
            },
          },
        },
      }),
    ]);

    if (cartItems > 0 || orderItems > 0) {
      throw new BadRequestException(
        'No se puede eliminar el producto porque está siendo usado en carritos o pedidos activos'
      );
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(id: number, quantity: number, type: 'IN' | 'OUT' | 'ADJUSTMENT', reason?: string) {
    const product = await this.findOne(id);

    const newStock = type === 'OUT' 
      ? product.stockQuantity - quantity 
      : type === 'IN' 
        ? product.stockQuantity + quantity 
        : quantity;

    if (newStock < 0) {
      throw new BadRequestException('Stock insuficiente');
    }

    return this.prisma.$transaction(async (tx) => {
      // Actualizar stock del producto
      const updatedProduct = await tx.product.update({
        where: { id },
        data: { stockQuantity: newStock },
      });

      // Registrar movimiento de inventario
      await tx.inventoryMovement.create({
        data: {
          productId: id,
          type,
          quantity: type === 'OUT' ? -quantity : quantity,
          reason,
        },
      });

      return updatedProduct;
    });
  }

  async getAvailableGifts() {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        hasGifts: false, // Solo productos que no tienen regalos pueden ser regalos
      },
      select: {
        id: true,
        name: true,
        presentation: true,
        price: true,
        imageUrl: true,
      },
      orderBy: [
        { name: 'asc' },
        { presentation: 'asc' },
      ],
    });
  }

  async checkStock(productId: number, quantity: number): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true },
    });

    return product ? product.stockQuantity >= quantity : false;
  }
}