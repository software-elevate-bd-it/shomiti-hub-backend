import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@ApiBearerAuth('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'User authenticated successfully' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new somitee user' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ description: 'User registration successful' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body);
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: any) {
    return this.authService.refreshToken(body);
  }

  @Post('logout')
  async logout() {
    return this.authService.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ description: 'Current user profile' })
  me(@CurrentUser() user: any) {
    return user;
  }
}
