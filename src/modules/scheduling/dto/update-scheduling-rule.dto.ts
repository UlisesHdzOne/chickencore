import { PartialType } from '@nestjs/swagger';
import { CreateSchedulingRuleDto } from './create-scheduling-rule.dto';

export class UpdateSchedulingRuleDto extends PartialType(CreateSchedulingRuleDto) {}