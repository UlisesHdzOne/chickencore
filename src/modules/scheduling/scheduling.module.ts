import { Module } from '@nestjs/common';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { SchedulingValidatorService } from './scheduling-validator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SchedulingController],
  providers: [SchedulingService, SchedulingValidatorService],
  exports: [SchedulingService, SchedulingValidatorService],
})
export class SchedulingModule {}