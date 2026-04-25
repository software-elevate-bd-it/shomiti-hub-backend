import {Body, Controller, Get, Put, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {SettingsService} from './settings.service';
import {ApiTags, ApiBearerAuth, ApiOperation} from '@nestjs/swagger';
import {UpdateProfileDto} from './dto/update-profile.dto';
import {ChangePasswordDto} from './dto/change-password.dto';
import {UpdatePrintTemplateDto} from './dto/update.print.template.dto';

@ApiTags('Settings')
@ApiBearerAuth('Authorization')
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  // Get user profile
  // @UseGuards(JwtAuthGuard) is not needed here since it's already applied at the controller level
  // @CurrentUser('id') is a custom decorator to extract the user ID from the JWT token
  // The service method will handle the logic to fetch the user profile from the database
  // The response will be returned in a consistent format, and any errors will be handled gracefully
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Get user profile'})
  async profile(@CurrentUser('id') userId: number) {
    return this.service.profile(userId);
  }

  // Update user profile
  // Similar to the profile method, this endpoint will also require authentication and will use the user ID from the JWT token
  // The body of the request will be validated against the UpdateProfileDto, which ensures that only valid data is processed
  // The service method will handle the logic to update the user profile in the database and return the updated profile or an appropriate response
  // Proper error handling will be implemented to ensure that any issues during the update process are logged and communicated back to the client in a user-friendly manner
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Update user profile'})
  async updateProfile(@CurrentUser('id') userId: number, @Body() body: UpdateProfileDto) {
    return this.service.updateProfile(userId, body);
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Change user password'})
  async changePassword(@CurrentUser('id') userId: number, @Body() body: ChangePasswordDto) {
    return this.service.changePassword(userId, body);
  }

  @Get('print-template')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Get print template'})
  async getPrintTemplate() {
    return this.service.printTemplate();
  }

  @Put('print-template')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Update print template'})
  async updatePrintTemplate(@Body() body: UpdatePrintTemplateDto) {
    return this.service.updatePrintTemplate(body);
  }
}
