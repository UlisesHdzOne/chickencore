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
  Query,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { SchedulingValidatorService } from './scheduling-validator.service';
import { CreateSchedulingRuleDto, UpdateSchedulingRuleDto, ValidateSchedulingDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(
    private readonly schedulingService: SchedulingService,
    private readonly schedulingValidatorService: SchedulingValidatorService,
  ) {}

  @Post('rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva regla de agendamiento' })
  @ApiResponse({ status: 201, description: 'Regla creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  createRule(@Body() createSchedulingRuleDto: CreateSchedulingRuleDto) {
    return this.schedulingService.createRule(createSchedulingRuleDto);
  }

  @Get('rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CASHIER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las reglas de agendamiento' })
  @ApiResponse({ status: 200, description: 'Lista de reglas obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  findAllRules() {
    return this.schedulingService.findAll();
  }

  @Get('rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CASHIER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener una regla de agendamiento por ID' })
  @ApiResponse({ status: 200, description: 'Regla obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Regla no encontrada' })
  findOneRule(@Param('id', ParseIntPipe) id: number) {
    return this.schedulingService.findOne(id);
  }

  @Patch('rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una regla de agendamiento' })
  @ApiResponse({ status: 200, description: 'Regla actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Regla no encontrada' })
  updateRule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSchedulingRuleDto: UpdateSchedulingRuleDto,
  ) {
    return this.schedulingService.update(id, updateSchedulingRuleDto);
  }

  @Delete('rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una regla de agendamiento' })
  @ApiResponse({ status: 200, description: 'Regla eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Regla no encontrada' })
  removeRule(@Param('id', ParseIntPipe) id: number) {
    return this.schedulingService.remove(id);
  }

  @Patch('rules/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar/desactivar una regla de agendamiento' })
  @ApiResponse({ status: 200, description: 'Regla actualizada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  @ApiResponse({ status: 404, description: 'Regla no encontrada' })
  toggleRule(@Param('id', ParseIntPipe) id: number) {
    return this.schedulingService.toggleRule(id);
  }

  @Post('rules/default')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear reglas de agendamiento por defecto' })
  @ApiResponse({ status: 201, description: 'Reglas por defecto creadas exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  createDefaultRules() {
    return this.schedulingService.createDefaultRules();
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validar si se puede agendar un pedido' })
  @ApiResponse({ status: 200, description: 'Validación realizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  validateScheduling(@Body() validateSchedulingDto: ValidateSchedulingDto) {
    return this.schedulingValidatorService.validateSchedulingRequest(
      validateSchedulingDto.scheduledFor,
      validateSchedulingDto.cartItems,
    );
  }

  @Get('info/weekly')
  @ApiOperation({ summary: 'Obtener información de agendamiento para toda la semana' })
  @ApiResponse({ status: 200, description: 'Información semanal obtenida exitosamente' })
  getWeeklySchedulingInfo() {
    return this.schedulingValidatorService.getWeeklySchedulingInfo();
  }

  @Get('info/day/:dayOfWeek')
  @ApiOperation({ summary: 'Obtener información de agendamiento para un día específico' })
  @ApiResponse({ status: 200, description: 'Información del día obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'No existe regla para este día' })
  getDaySchedulingInfo(@Param('dayOfWeek', ParseIntPipe) dayOfWeek: number) {
    return this.schedulingValidatorService.getSchedulingInfo(dayOfWeek);
  }

  @Get('time-slots')
  @ApiOperation({ summary: 'Obtener horarios disponibles para una fecha' })
  @ApiResponse({ status: 200, description: 'Horarios disponibles obtenidos exitosamente' })
  @ApiQuery({ name: 'date', description: 'Fecha en formato YYYY-MM-DD' })
  getAvailableTimeSlots(@Query('date') date: string) {
    const targetDate = new Date(date);
    return this.schedulingValidatorService.getAvailableTimeSlots(targetDate);
  }
}