import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format, getDay, isAfter, isBefore, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface CartItem {
  productId: number;
  quantity: number;
  productName: string;
  price: number;
}

interface ValidationResult {
  canSchedule: boolean;
  reason?: string;
  rule?: any;
}

@Injectable()
export class SchedulingValidatorService {
  constructor(private prisma: PrismaService) {}

  async canScheduleOrder(
    orderDate: Date,
    cartItems: CartItem[],
    total: number,
  ): Promise<ValidationResult> {
    const dayOfWeek = getDay(orderDate);
    
    // Obtener regla para el día de la semana
    const rule = await this.getSchedulingRule(dayOfWeek);
    
    if (!rule || !rule.isActive) {
      return {
        canSchedule: false,
        reason: `No se permite agendar pedidos para ${this.getDayName(dayOfWeek)}`,
      };
    }

    // Validar horario si está configurado
    if (rule.startTime && rule.endTime) {
      const orderTime = format(orderDate, 'HH:mm');
      
      if (orderTime < rule.startTime || orderTime > rule.endTime) {
        return {
          canSchedule: false,
          reason: `El horario de entrega debe estar entre ${rule.startTime} y ${rule.endTime}`,
          rule,
        };
      }
    }

    // Validar monto mínimo
    if (rule.minAmount && total < rule.minAmount.toNumber()) {
      return {
        canSchedule: false,
        reason: `Monto mínimo requerido: $${rule.minAmount.toNumber().toFixed(2)} MXN`,
        rule,
      };
    }

    // Validar cantidad mínima de pollos
    if (rule.minChickenQuantity) {
      const chickenCount = this.countChickenProducts(cartItems);
      
      if (chickenCount < rule.minChickenQuantity) {
        return {
          canSchedule: false,
          reason: `Mínimo ${rule.minChickenQuantity} pollos requeridos para ${this.getDayName(dayOfWeek)}`,
          rule,
        };
      }
    }

    // Validar que la fecha no sea en el pasado
    if (isBefore(orderDate, new Date())) {
      return {
        canSchedule: false,
        reason: 'No se puede agendar pedidos en fechas pasadas',
        rule,
      };
    }

    // Validar que no sea muy lejos en el futuro (máximo 30 días)
    const maxFutureDate = new Date();
    maxFutureDate.setDate(maxFutureDate.getDate() + 30);
    
    if (isAfter(orderDate, maxFutureDate)) {
      return {
        canSchedule: false,
        reason: 'No se puede agendar pedidos con más de 30 días de anticipación',
        rule,
      };
    }

    return {
      canSchedule: true,
      rule,
    };
  }

  async getSchedulingRule(dayOfWeek: number) {
    return this.prisma.schedulingRule.findUnique({
      where: { dayOfWeek },
    });
  }

  async getAllSchedulingRules() {
    return this.prisma.schedulingRule.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async getAvailableTimeSlots(date: Date): Promise<string[]> {
    const dayOfWeek = getDay(date);
    const rule = await this.getSchedulingRule(dayOfWeek);
    
    if (!rule || !rule.isActive || !rule.startTime || !rule.endTime) {
      return [];
    }

    const slots: string[] = [];
    const startTime = parse(rule.startTime, 'HH:mm', new Date());
    const endTime = parse(rule.endTime, 'HH:mm', new Date());
    
    // Generar slots cada 30 minutos
    let currentTime = startTime;
    while (isBefore(currentTime, endTime)) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  }

  async validateSchedulingRequest(
    scheduledFor: string,
    cartItems: CartItem[],
  ): Promise<ValidationResult> {
    const orderDate = new Date(scheduledFor);
    
    // Calcular total
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    return this.canScheduleOrder(orderDate, cartItems, total);
  }

  private countChickenProducts(cartItems: CartItem[]): number {
    return cartItems.reduce((count, item) => {
      // Contar como pollo si el nombre contiene "pollo"
      if (item.productName.toLowerCase().includes('pollo')) {
        return count + item.quantity;
      }
      return count;
    }, 0);
  }

  private getDayName(dayOfWeek: number): string {
    const days = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return days[dayOfWeek];
  }

  async getSchedulingInfo(dayOfWeek: number) {
    const rule = await this.getSchedulingRule(dayOfWeek);
    
    if (!rule || !rule.isActive) {
      return {
        canSchedule: false,
        dayName: this.getDayName(dayOfWeek),
        reason: 'No se permite agendar pedidos para este día',
      };
    }

    return {
      canSchedule: true,
      dayName: this.getDayName(dayOfWeek),
      minAmount: rule.minAmount?.toNumber(),
      minChickenQuantity: rule.minChickenQuantity,
      startTime: rule.startTime,
      endTime: rule.endTime,
      description: rule.description,
    };
  }

  async getWeeklySchedulingInfo() {
    const weekInfo = [];
    
    for (let day = 0; day < 7; day++) {
      const info = await this.getSchedulingInfo(day);
      weekInfo.push({
        dayOfWeek: day,
        ...info,
      });
    }

    return weekInfo;
  }
}