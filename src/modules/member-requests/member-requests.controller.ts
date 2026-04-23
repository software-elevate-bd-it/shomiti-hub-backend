import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags} from '@nestjs/swagger';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {MemberRequestsService} from './member-requests.service';
import {RegisterMemberDto} from './dto/register-member.dto';
import {DraftMemberDto} from './dto/draft-member.dto';
import {UploadImagesDto} from './dto/upload-images.dto';
import {Express} from 'express';
import * as multer from 'multer';

@ApiTags('Member Requests')
@ApiBearerAuth('Authorization')
@Controller('members')
export class MemberRequestsController {
  constructor(private readonly service: MemberRequestsService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Submit a new member registration'})
  @ApiBody({type: RegisterMemberDto})
  async register(
    @Body() dto: RegisterMemberDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('somiteeId') somiteeId: number,
  ) {
    return this.service.register(dto, userId, somiteeId);
  }

  @Post('register/upload-images')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Upload images for member registration'})
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload profile image, NID front/back, and signature',
    type: UploadImagesDto,
  })
  @UseInterceptors(FilesInterceptor('files', 4))
  async uploadImages(
    @Body() dto: UploadImagesDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('id') userId: number,
    @CurrentUser('somiteeId') somiteeId: number,
  ) {
    return this.service.uploadImages(dto, files, userId, somiteeId);
  }

  @Post('register/draft')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Auto-save registration as draft'})
  @ApiBody({type: DraftMemberDto})
  async saveDraft(
    @Body() dto: DraftMemberDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('somiteeId') somiteeId: number,
  ) {
    return this.service.saveDraft(dto, userId, somiteeId);
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  async list(
    @CurrentUser('somiteeId') somiteeId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.service.list(somiteeId, Number(page), Number(limit));
  }

  @Patch('requests/:id/approve')
  @UseGuards(JwtAuthGuard)
  async approve(
    @Param('id') id: number,
    @CurrentUser('id') userId: number,
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() body: any,
  ) {
    return this.service.approve(id, userId, somiteeId, body);
  }

  @Patch('requests/:id/reject')
  @UseGuards(JwtAuthGuard)
  async reject(
    @Param('id') id: number,
    @CurrentUser('id') userId: number,
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() body: any,
  ) {
    return this.service.reject(id, userId, somiteeId, body);
  }

  @Delete('requests/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number, @CurrentUser('somiteeId') somiteeId: number) {
    return this.service.remove(id, somiteeId);
  }
}
