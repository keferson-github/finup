import { PartialType } from '@nestjs/swagger';
import { CreateRecurringTemplateDto } from './create-recurring-template.dto';

export class UpdateRecurringTemplateDto extends PartialType(CreateRecurringTemplateDto) {}