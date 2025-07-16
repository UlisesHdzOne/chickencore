import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  @ApiOperation({ summary: 'Agregar producto al carrito' })
  @ApiResponse({ status: 201, description: 'Producto agregado al carrito exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o stock insuficiente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener carrito del usuario' })
  @ApiResponse({ status: 200, description: 'Carrito obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obtener resumen del carrito' })
  @ApiResponse({ status: 200, description: 'Resumen del carrito obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getCartSummary(@Request() req) {
    return this.cartService.getCartSummary(req.user.id);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Actualizar cantidad de un item del carrito' })
  @ApiResponse({ status: 200, description: 'Item actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o stock insuficiente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Item no encontrado' })
  updateCartItem(
    @Request() req,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.id, itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Eliminar item del carrito' })
  @ApiResponse({ status: 200, description: 'Item eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Item no encontrado' })
  removeFromCart(@Request() req, @Param('itemId', ParseIntPipe) itemId: number) {
    return this.cartService.removeFromCart(req.user.id, itemId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Vaciar carrito' })
  @ApiResponse({ status: 200, description: 'Carrito vaciado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validar carrito para checkout' })
  @ApiResponse({ status: 200, description: 'Carrito válido para checkout' })
  @ApiResponse({ status: 400, description: 'Carrito inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  validateCartForCheckout(@Request() req) {
    return this.cartService.validateCartForCheckout(req.user.id);
  }
}