import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto, RemoveRoleDto } from './dto/roles.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getRoles(@CurrentUser() user: any) {
    const somiteeId = user.role === 'super_admin' ? undefined : user.somiteeId;
    return {
      success: true,
      statusCode: 200,
      message: 'Roles retrieved',
      data: await this.rolesService.getRoles(somiteeId),
    };
  }

  @Post()
  @Roles('roles.manage')
  async createRole(@Body() dto: CreateRoleDto, @CurrentUser() user: any) {
    const role = await this.rolesService.createRole(dto, user.somiteeId, user.role);
    return {
      success: true,
      statusCode: 201,
      message: 'Role created',
      data: role,
    };
  }

  @Put(':id')
  @Roles('roles.manage')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto, @CurrentUser() user: any) {
    const role = await this.rolesService.updateRole(id, dto, user.somiteeId);
    return {
      success: true,
      statusCode: 200,
      message: 'Role updated',
      data: role,
    };
  }

  @Delete(':id')
  @Roles('roles.manage')
  async deleteRole(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.rolesService.deleteRole(id, user.somiteeId);
    return {
      success: true,
      statusCode: 200,
      message: result.message,
      data: null,
    };
  }

  @Post('assign')
  @Roles('roles.manage')
  async assignRole(@Body() dto: AssignRoleDto, @CurrentUser() user: any) {
    const assignment = await this.rolesService.assignRole(dto, user.somiteeId);
    return {
      success: true,
      statusCode: 201,
      message: 'Role assigned',
      data: assignment,
    };
  }

  @Delete('assign')
  @Roles('roles.manage')
  async removeRole(@Body() dto: RemoveRoleDto) {
    const result = await this.rolesService.removeRole(dto);
    return {
      success: true,
      statusCode: 200,
      message: result.message,
      data: null,
    };
  }

  @Get('assignments')
  async getRoleAssignments(@Query('userId') userId: string, @CurrentUser() user: any) {
    const assignments = await this.rolesService.getRoleAssignments(user.somiteeId, userId);
    return {
      success: true,
      statusCode: 200,
      message: 'Assignments retrieved',
      data: assignments,
    };
  }

  @Get('me/permissions')
  async getUserPermissions(@CurrentUser() user: any) {
    const permissions = await this.rolesService.getUserPermissions(user.id);
    return {
      success: true,
      statusCode: 200,
      message: 'Permissions retrieved',
      data: permissions,
    };
  }
}