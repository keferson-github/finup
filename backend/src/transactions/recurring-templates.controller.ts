import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecurringTemplatesService } from './recurring-templates.service';
import { CreateRecurringTemplateDto } from './dto/create-recurring-template.dto';
import { UpdateRecurringTemplateDto } from './dto/update-recurring-template.dto';

@ApiTags('Recurring Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recurring-templates')
export class RecurringTemplatesController {
  constructor(private readonly templatesService: RecurringTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recurring template' })
  create(@Request() req, @Body() createTemplateDto: CreateRecurringTemplateDto) {
    return this.templatesService.create(req.user.userId, createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user recurring templates' })
  findAll(@Request() req) {
    return this.templatesService.findAll(req.user.userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active recurring templates' })
  getActiveTemplates(@Request() req) {
    return this.templatesService.getActiveTemplates(req.user.userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get templates ready for execution' })
  getUpcomingExecutions(@Request() req) {
    return this.templatesService.getUpcomingExecutions(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recurring template by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.templatesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update recurring template' })
  update(@Param('id') id: string, @Request() req, @Body() updateTemplateDto: UpdateRecurringTemplateDto) {
    return this.templatesService.update(id, req.user.userId, updateTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete recurring template' })
  remove(@Param('id') id: string, @Request() req) {
    return this.templatesService.remove(id, req.user.userId);
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generate next transaction from template' })
  generateTransaction(@Param('id') id: string, @Request() req) {
    return this.templatesService.generateTransaction(id, req.user.userId);
  }

  @Post(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle template active status' })
  toggleActive(@Param('id') id: string, @Request() req) {
    return this.templatesService.toggleActive(id, req.user.userId);
  }
}