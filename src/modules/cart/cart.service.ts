import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { productId, quantity, selectedGifts = [] } = addToCartDto;

    // Verificar que el producto existe y está activo
    const product = await this.productsService.findOne(productId);
    if (!product.isActive) {
      throw new BadRequestException('El producto no está disponible');
    }

    // Verificar stock disponible
    const hasStock = await this.productsService.checkStock(productId, quantity);
    if (!hasStock) {
      throw new BadRequestException('Stock insuficiente');
    }

    // Validar regalos seleccionados
    if (product.hasGifts && selectedGifts.length > 0) {
      await this.validateSelectedGifts(product, selectedGifts);
    }

    // Obtener o crear carrito
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Verificar si ya existe el producto en el carrito
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Actualizar cantidad del item existente
      const newQuantity = existingItem.quantity + quantity;
      
      // Verificar stock para la nueva cantidad
      const hasStockForUpdate = await this.productsService.checkStock(productId, newQuantity);
      if (!hasStockForUpdate) {
        throw new BadRequestException('Stock insuficiente para la cantidad solicitada');
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          selectedGifts: {
            deleteMany: {},
            create: selectedGifts.map(gift => ({
              giftId: gift.giftId,
              quantity: gift.quantity * newQuantity,
            })),
          },
        },
        include: {
          product: true,
          selectedGifts: {
            include: {
              gift: true,
            },
          },
        },
      });
    } else {
      // Crear nuevo item en el carrito
      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          selectedGifts: {
            create: selectedGifts.map(gift => ({
              giftId: gift.giftId,
              quantity: gift.quantity * quantity,
            })),
          },
        },
        include: {
          product: true,
          selectedGifts: {
            include: {
              gift: true,
            },
          },
        },
      });
    }
  }

  async getCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            selectedGifts: {
              include: {
                gift: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        items: [],
        total: 0,
        itemCount: 0,
      };
    }

    // Calcular totales
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price.toNumber() * item.quantity);
    }, 0);

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      ...cart,
      total,
      itemCount,
    };
  }

  async updateCartItem(userId: number, itemId: number, updateCartItemDto: UpdateCartItemDto) {
    const { quantity } = updateCartItemDto;

    // Verificar que el item pertenece al usuario
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
      include: {
        product: true,
        selectedGifts: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    // Verificar stock disponible
    const hasStock = await this.productsService.checkStock(cartItem.productId, quantity);
    if (!hasStock) {
      throw new BadRequestException('Stock insuficiente');
    }

    // Actualizar cantidad y regalos proporcionalmente
    const updatedItem = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        selectedGifts: {
          deleteMany: {},
          create: cartItem.selectedGifts.map(gift => ({
            giftId: gift.giftId,
            quantity: Math.floor(gift.quantity / cartItem.quantity) * quantity,
          })),
        },
      },
      include: {
        product: true,
        selectedGifts: {
          include: {
            gift: true,
          },
        },
      },
    });

    return updatedItem;
  }

  async removeFromCart(userId: number, itemId: number) {
    // Verificar que el item pertenece al usuario
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { message: 'Item eliminado del carrito' };
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return { message: 'Carrito ya está vacío' };
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Carrito vaciado exitosamente' };
  }

  async getCartSummary(userId: number) {
    const cart = await this.getCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      return {
        itemCount: 0,
        total: 0,
        subtotal: 0,
        tax: 0,
        canSchedule: false,
        chickenCount: 0,
      };
    }

    const subtotal = cart.total;
    const tax = subtotal * 0.16; // 16% IVA
    const total = subtotal + tax;

    // Contar pollos para validaciones de agendamiento
    const chickenCount = cart.items.reduce((count, item) => {
      if (item.product.name.toLowerCase().includes('pollo')) {
        return count + item.quantity;
      }
      return count;
    }, 0);

    return {
      itemCount: cart.itemCount,
      subtotal,
      tax,
      total,
      chickenCount,
      canSchedule: total >= 300 || chickenCount >= 5, // Regla básica
    };
  }

  private async validateSelectedGifts(product: any, selectedGifts: any[]) {
    // Obtener los regalos disponibles para este producto
    const availableGifts = product.gifts;
    
    for (const selectedGift of selectedGifts) {
      const availableGift = availableGifts.find(
        (gift: any) => gift.giftId === selectedGift.giftId
      );

      if (!availableGift) {
        throw new BadRequestException(
          `El regalo con ID ${selectedGift.giftId} no está disponible para este producto`
        );
      }

      if (selectedGift.quantity > availableGift.quantity) {
        throw new BadRequestException(
          `Cantidad de regalo excede el límite permitido (máximo: ${availableGift.quantity})`
        );
      }
    }
  }

  async validateCartForCheckout(userId: number) {
    const cart = await this.getCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // Validar stock de todos los productos
    for (const item of cart.items) {
      const hasStock = await this.productsService.checkStock(
        item.product.id,
        item.quantity
      );
      
      if (!hasStock) {
        throw new BadRequestException(
          `Stock insuficiente para ${item.product.name} ${item.product.presentation}`
        );
      }
    }

    return true;
  }
}