import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get('profile')
  async profile(@CurrentUser('id') userId: string) {
    return this.service.profile(userId);
  }

  @Put('profile')
  async updateProfile(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.updateProfile(userId, body);
  }

  @Put('password')
  async changePassword(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.changePassword(userId, body);
  }

  @Get('print-template')
  async getPrintTemplate() {
    return this.service.printTemplate();
  }

  @Put('print-template')
  async updatePrintTemplate(@Body() body: any) {
    return this.service.updatePrintTemplate(body);
  }
}
