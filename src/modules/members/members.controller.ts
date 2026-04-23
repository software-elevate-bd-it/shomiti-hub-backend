import {Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards} from '@nestjs/common';
import {ApiBody, ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {MembersService} from './members.service';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {CreateMemberDto} from './dto/create-member.dto';
import {UpdateMemberDto} from './dto/update-member.dto';
import {MemberQueryDto} from './dto/member-query.dto';

@ApiTags('Members')
@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async getAll(@CurrentUser('somiteeId') somiteeId: number, @Query() query: MemberQueryDto) {
    return this.membersService.list(somiteeId, query);
  }

  @Get(':id')
  async getOne(@Param('id') id: number, @CurrentUser('somiteeId') somiteeId: number) {
    return this.membersService.findOne(id, somiteeId);
  }

  @Post()
  @ApiOperation({summary: 'Create a new member'})
  @ApiBody({type: CreateMemberDto})
  @ApiOkResponse({description: 'Member created successfully'})
  async create(
    @CurrentUser('somiteeId') somiteeId: number,
    @CurrentUser('id') userId: number,
    @Body() dto: CreateMemberDto,
  ) {
    return this.membersService.create(somiteeId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({summary: 'Update an existing member'})
  @ApiBody({type: UpdateMemberDto})
  @ApiOkResponse({description: 'Member updated successfully'})
  async update(
    @Param('id') id: number,
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.update(id, somiteeId, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @CurrentUser('somiteeId') somiteeId: number) {
    return this.membersService.remove(id, somiteeId);
  }

  @Get(':id/ledger')
  async ledger(
    @Param('id') id: number,
    @CurrentUser('somiteeId') somiteeId: number,
    @Query() query: any,
  ) {
    return this.membersService.ledger(id, somiteeId, query);
  }

  @Get(':id/payment-history')
  async paymentHistory(
    @Param('id') id: number,
    @CurrentUser('somiteeId') somiteeId: number,
    @Query() query: any,
  ) {
    return this.membersService.paymentHistory(id, somiteeId, query);
  }

  @Get(':id/due-history')
  async dueHistory(@Param('id') id: number, @CurrentUser('somiteeId') somiteeId: number) {
    return this.membersService.dueHistory(id, somiteeId);
  }

  @Get(':id/report')
  async report(
    @Param('id') id: number,
    @CurrentUser('somiteeId') somiteeId: number,
    @Query() query: any,
  ) {
    return this.membersService.report(id, somiteeId, query);
  }

  @Post(':id/upload-photo')
  async uploadPhoto(
    @Param('id') id: number,
    @CurrentUser('somiteeId') somiteeId: number,
    @Body() body: any,
  ) {
    return this.membersService.uploadPhoto(id, somiteeId, body);
  }
}
