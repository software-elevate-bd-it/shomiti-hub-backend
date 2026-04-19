import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FaqService } from './faq.service';

@Controller('faq')
@UseGuards(JwtAuthGuard)
export class FaqController {
  constructor(private readonly service: FaqService) {}

  @Get()
  async list(@Query() query: any) {
    return this.service.list(query);
  }

  @Post()
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
