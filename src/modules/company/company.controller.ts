import {Body, Controller, Get, Post, Put, UseGuards} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiTags} from '@nestjs/swagger';
import {CompanyService} from './company.service';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {UpdateCompanySettingsDto} from './dto/update-company-settings.dto';

@ApiTags('Company')
@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('settings')
  async getSettings(@CurrentUser('somiteeId') somiteeId: number) {
    return this.companyService.getSettings(somiteeId);
  }

  @Put('settings')
  @ApiOperation({summary: 'Update company profile settings'})
  @ApiBody({type: UpdateCompanySettingsDto})
  async updateSettings(
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() dto: UpdateCompanySettingsDto,
  ) {
    return this.companyService.updateSettings(somiteeId, dto);
  }

  @Post('upload-logo')
  async uploadLogo(@CurrentUser('somiteeId') somiteeId: number, @Body() body: any) {
    return this.companyService.uploadLogo(somiteeId, body.logoUrl);
  }

  @Post('upload-signature')
  async uploadSignature(@CurrentUser('somiteeId') somiteeId: number, @Body() body: any) {
    return this.companyService.uploadSignature(somiteeId, body.signatureUrl);
  }
}
