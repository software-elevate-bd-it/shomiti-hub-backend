import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SomiteesService } from './somitees.service';

@Controller('admin/somitees')
@UseGuards(JwtAuthGuard)
export class SomiteesController {
  constructor(private readonly service: SomiteesService) {}

  @Get()
  async list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Patch(':id/status')
  async changeStatus(@Param('id') id: string, @Body() body: any) {
    return this.service.changeStatus(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
