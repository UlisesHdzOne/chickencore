import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchedulingRuleDto, UpdateSchedulingRuleDto } from './dto';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  async createRule(createSchedulingRuleDto: CreateSchedulingRuleDto) {
    // Verificar si ya existe una regla para este día
    const existingRule = await this.prisma.schedulingRule.findUnique({
      where: { dayOfWeek: createSchedulingRuleDto.dayOfWeek },
    });

    if (existingRule) {
      throw new BadRequestException(
        `Ya existe una regla para el día ${this.getDayName(createSchedulingRuleDto.dayOfWeek)}`
      );
    }

    // Validar horarios si se proporcionan
    if (createSchedulingRuleDto.startTime && createSchedulingRuleDto.endTime) {
      if (createSchedulingRuleDto.startTime >= createSchedulingRuleDto.endTime) {
        throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
      }
    }

    return this.prisma.schedulingRule.create({
      data: createSchedulingRuleDto,
    });
  }

  async findAll() {
    const rules = await this.prisma.schedulingRule.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });

    // Agregar nombre del día para mejor UX
    return rules.map(rule => ({
      ...rule,
      dayName: this.getDayName(rule.dayOfWeek),
    }));
  }

  async findOne(id: number) {
    const rule = await this.prisma.schedulingRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException(`Regla de agendamiento con ID ${id} no encontrada`);
    }

    return {
      ...rule,
      dayName: this.getDayName(rule.dayOfWeek),
    };
  }

  async findByDayOfWeek(dayOfWeek: number) {
    const rule = await this.prisma.schedulingRule.findUnique({
      where: { dayOfWeek },
    });

    if (!rule) {
      throw new NotFoundException(
        `No existe regla para el día ${this.getDayName(dayOfWeek)}`
      );
    }

    return {
      ...rule,
      dayName: this.getDayName(rule.dayOfWeek),
    };
  }

  async update(id: number, updateSchedulingRuleDto: UpdateSchedulingRuleDto) {
    // Verificar que la regla existe
    await this.findOne(id);

    // Validar horarios si se proporcionan
    if (updateSchedulingRuleDto.startTime && updateSchedulingRuleDto.endTime) {
      if (updateSchedulingRuleDto.startTime >= updateSchedulingRuleDto.endTime) {
        throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
      }
    }

    // Si se actualiza el día de la semana, verificar que no exista otra regla
    if (updateSchedulingRuleDto.dayOfWeek !== undefined) {
      const existingRule = await this.prisma.schedulingRule.findUnique({
        where: { dayOfWeek: updateSchedulingRuleDto.dayOfWeek },
      });

      if (existingRule && existingRule.id !== id) {
        throw new BadRequestException(
          `Ya existe una regla para el día ${this.getDayName(updateSchedulingRuleDto.dayOfWeek)}`
        );
      }
    }

    const updatedRule = await this.prisma.schedulingRule.update({
      where: { id },
      data: updateSchedulingRuleDto,
    });

    return {
      ...updatedRule,
      dayName: this.getDayName(updatedRule.dayOfWeek),
    };
  }

  async remove(id: number) {
    // Verificar que la regla existe
    await this.findOne(id);

    return this.prisma.schedulingRule.delete({
      where: { id },
    });
  }

  async toggleRule(id: number) {
    const rule = await this.findOne(id);
    
    const updatedRule = await this.prisma.schedulingRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });

    return {
      ...updatedRule,
      dayName: this.getDayName(updatedRule.dayOfWeek),
    };
  }

  async createDefaultRules() {
    const defaultRules = [
      // Lunes a Jueves - Reglas estrictas
      {
        dayOfWeek: 1, // Lunes
        isActive: true,
        minAmount: 300,
        minChickenQuantity: 5,
        startTime: '09:00',
        endTime: '18:00',
        description: 'Lunes: Mínimo $300 MXN o 5 pollos',
      },
      {
        dayOfWeek: 2, // Martes
        isActive: true,
        minAmount: 300,
        minChickenQuantity: 5,
        startTime: '09:00',
        endTime: '18:00',
        description: 'Martes: Mínimo $300 MXN o 5 pollos',
      },
      {
        dayOfWeek: 3, // Miércoles
        isActive: true,
        minAmount: 300,
        minChickenQuantity: 5,
        startTime: '09:00',
        endTime: '18:00',
        description: 'Miércoles: Mínimo $300 MXN o 5 pollos',
      },
      {
        dayOfWeek: 4, // Jueves
        isActive: true,
        minAmount: 300,
        minChickenQuantity: 5,
        startTime: '09:00',
        endTime: '18:00',
        description: 'Jueves: Mínimo $300 MXN o 5 pollos',
      },
      // Viernes a Domingo - Sin restricciones
      {
        dayOfWeek: 5, // Viernes
        isActive: true,
        minAmount: null,
        minChickenQuantity: null,
        startTime: '09:00',
        endTime: '20:00',
        description: 'Viernes: Sin restricciones',
      },
      {
        dayOfWeek: 6, // Sábado
        isActive: true,
        minAmount: null,
        minChickenQuantity: null,
        startTime: '09:00',
        endTime: '20:00',
        description: 'Sábado: Sin restricciones',
      },
      {
        dayOfWeek: 0, // Domingo
        isActive: true,
        minAmount: null,
        minChickenQuantity: null,
        startTime: '10:00',
        endTime: '18:00',
        description: 'Domingo: Sin restricciones',
      },
    ];

    const createdRules = [];
    
    for (const ruleData of defaultRules) {
      try {
        const rule = await this.prisma.schedulingRule.create({
          data: ruleData,
        });
        createdRules.push(rule);
      } catch (error) {
        // Si ya existe, continuar con la siguiente
        console.log(`Regla para día ${ruleData.dayOfWeek} ya existe`);
      }
    }

    return createdRules;
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
}