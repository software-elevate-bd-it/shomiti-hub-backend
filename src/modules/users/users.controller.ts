import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {UsersService} from './users.service';
import {CreateUserDto, UpdateUserDto} from './dto/users.dto';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {RolesGuard} from '../../common/guards/roles.guard';
import {Roles} from '../../common/decorators/roles.decorator';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {ApiTags, ApiBearerAuth, ApiOperation} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('Authorization')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Get users list'})
  @Roles('users.manage')
  async getUsers(@Query() query: any, @CurrentUser() user: any) {
    const result = await this.usersService.getUsers(user.somiteeId, query);
    return {
      success: true,
      statusCode: 200,
      message: 'Users retrieved',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Get user details'})
  @Roles('users.manage')
  async getUser(@Param('id') id: number, @CurrentUser() user: any) {
    const userData = await this.usersService.getUser(id, user.somiteeId);
    return {
      success: true,
      statusCode: 200,
      message: 'User retrieved',
      data: userData,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Create new user'})
  @Roles('users.manage')
  async createUser(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    const newUser = await this.usersService.createUser(dto, user.somiteeId, user.id);
    return {
      success: true,
      statusCode: 201,
      message: 'User created',
      data: newUser,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Update user details'})
  @Roles('users.manage')
  async updateUser(@Param('id') id: number, @Body() dto: UpdateUserDto, @CurrentUser() user: any) {
    const updatedUser = await this.usersService.updateUser(id, dto, user.somiteeId);
    return {
      success: true,
      statusCode: 200,
      message: 'User updated',
      data: updatedUser,
    };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Update user status'})
  @Roles('users.manage')
  async updateUserStatus(
    @Param('id') id: number,
    @Body() body: {status: 'active' | 'inactive'},
    @CurrentUser() user: any,
  ) {
    const updatedUser = await this.usersService.updateUser(
      id,
      {status: body.status},
      user.somiteeId,
    );
    return {
      success: true,
      statusCode: 200,
      message: `User ${body.status === 'active' ? 'activated' : 'deactivated'}`,
      data: updatedUser,
    };
  }

  @Delete(':id')
  @Roles('users.manage')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Delete user'})
  async deleteUser(@Param('id') id: number, @CurrentUser() user: any) {
    const result = await this.usersService.deleteUser(id, user.somiteeId);
    return {
      success: true,
      statusCode: 200,
      message: result.message,
      data: null,
    };
  }

  @Post(':id/reset-password')
  @Roles('users.manage')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Reset user password'})
  async resetPassword(@Param('id') id: number, @CurrentUser() user: any) {
    const result = await this.usersService.resetPassword(id, user.somiteeId);
    return {
      success: true,
      statusCode: 200,
      message: 'Password reset',
      data: result,
    };
  }
}
