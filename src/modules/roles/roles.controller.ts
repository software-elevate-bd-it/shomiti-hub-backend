import {Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards} from '@nestjs/common';
import {RolesService} from './roles.service';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {RolesGuard} from '../../common/guards/roles.guard';
import {Roles} from '../../common/decorators/roles.decorator';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {ApiTags, ApiBearerAuth, ApiOperation} from '@nestjs/swagger';
import {ListRoleDto} from './dto/list-role.dto';
import {CreateRoleDto} from './dto/create-role.dto';
import {UpdateRoleDto} from './dto/update-role.dto';
import {AssignRoleDto} from './dto/assign-role.dto';
import {RemoveRoleDto} from './dto/role-assign-remove.dto';
import {GetRoleAssignmentsDto} from './dto/get-role-assignments.dto';

@ApiTags('Roles')
@ApiBearerAuth('Authorization')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Get roles with optional filtering by name and somiteeId (for super_admin)
  // This endpoint allows super_admin to retrieve all roles, while regular users can only retrieve roles associated with their somiteeId
  // The ListRoleDto is used to validate and document the optional query parameter for filtering roles by name
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Get roles list'})
  async getRoles(@CurrentUser() user: any, @Query() query: ListRoleDto) {
    const somiteeId = user.role === 'super_admin' ? undefined : user.somiteeId;

    const data = await this.rolesService.getRoles(somiteeId, query);

    return {
      success: true,
      statusCode: 200,
      message: 'Roles retrieved',
      data,
    };
  }

  // Create a new role associated with the user's somiteeId
  // This endpoint allows users with the 'roles.manage' permission to create new roles for their somitee
  // The CreateRoleDto is used to validate and document the request body for creating a new role, including its name, description, and permissions
  // The user's somiteeId is automatically associated with the new role to ensure it is created within the correct organizational context
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Create role'})
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

  // Update an existing role with error handling and logging
  // Validates input data, checks for role existence, and ensures that preset roles cannot be renamed
  // Also checks for duplicate role names when updating the name of a role
  // Logs detailed error information if the operation fails, and throws appropriate HTTP exceptions for different error scenarios
  // The method handles both super_admin and regular user roles to ensure that updates are made within the correct organizational context.
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Update role'})
  @Roles('roles.manage')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto, @CurrentUser() user: any) {
    const role = await this.rolesService.updateRole(Number(id), dto, user.somiteeId, user.role);

    return {
      success: true,
      statusCode: 200,
      message: 'Role updated',
      data: role,
    };
  }

  // Delete a role with error handling and logging
  // Validates the role ID, checks for role existence, and ensures that preset roles cannot be deleted
  // Logs detailed error information if the operation fails, and throws appropriate HTTP exceptions for different error scenarios
  // The method handles both super_admin and regular user roles to ensure that deletions are made within the correct organizational context.
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('roles.manage')
  @ApiOperation({summary: 'Delete role'})
  async deleteRole(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.rolesService.deleteRole(Number(id), user.somiteeId, user.role);

    return {
      success: true,
      statusCode: 200,
      message: result.message,
      data: null,
    };
  }

  // Assign a role to a user with error handling and logging
  // Validates input data, checks for user and role existence, and ensures that the user belongs to the correct somitee
  // Also checks for duplicate role assignments to prevent assigning the same role multiple times to a user
  // Logs detailed error information if the operation fails, and throws appropriate HTTP exceptions for different error scenarios
  // The method handles both super_admin and regular user roles to ensure that role assignments are made within the correct organizational context.
  @Post('assign')
  @UseGuards(JwtAuthGuard)
  @Roles('roles.manage')
  @ApiOperation({summary: 'Assign role to user'})
  async assignRole(@Body() dto: AssignRoleDto, @CurrentUser() user: any) {
    const assignment = await this.rolesService.assignRole(dto, user.somiteeId, user.role);

    return {
      success: true,
      statusCode: 201,
      message: 'Role assigned',
      data: assignment,
    };
  }

  // Remove a role from a user with error handling and logging
  // Validates input data, checks for user and role existence, and ensures that the user belongs to the correct somitee
  // Logs detailed error information if the operation fails, and throws appropriate HTTP exceptions for different error scenarios
  // The method handles both super_admin and regular user roles to ensure that role removals are made within the correct organizational context.
  @Delete('assign')
  @UseGuards(JwtAuthGuard)
  @Roles('roles.manage')
  @ApiOperation({summary: 'Remove role from user'})
  async removeRole(@Body() dto: RemoveRoleDto, @CurrentUser() user: any) {
    const result = await this.rolesService.removeAssignRole(dto, user.somiteeId, user.role);

    return {
      success: true,
      statusCode: 200,
      message: result.message,
      data: null,
    };
  }

  // Get role assignments with error handling and logging
  // Validates input data, checks for user and role existence, and ensures that the user belongs to the correct somitee
  // Supports pagination and filtering by user ID, and logs detailed error information if the operation fails
  // The method handles both super_admin and regular user roles to ensure that role assignment retrieval is made within the correct organizational context.
  // It returns a paginated list of role assignments with user and role details, along with metadata about the pagination state.
  @Get('assignments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Get role assignments'})
  async getRoleAssignments(@Query() query: GetRoleAssignmentsDto, @CurrentUser() user: any) {
    const assignments = await this.rolesService.getRoleAssignments(
      user.somiteeId,
      user.role,
      query,
    );

    return {
      success: true,
      statusCode: 200,
      message: 'Assignments retrieved',
      data: assignments.data,
      meta: assignments.meta,
    };
  }

  @Get('me/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Get role assignments'})
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
