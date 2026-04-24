import {Controller, Get, Post, Patch, Param, Body, Query, UseGuards} from '@nestjs/common';
import {ApprovalsService} from './approvals.service';
import {CreateApprovalDto, ApproveRejectDto} from './dto/approvals.dto';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {RolesGuard} from '../../common/guards/roles.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Approvals')
@Controller('approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  async getApprovals(@Query() query: any, @CurrentUser() user: any) {
    const result = await this.approvalsService.getApprovals(user.somiteeId, query);
    return {
      success: true,
      statusCode: 200,
      message: 'Approvals retrieved',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async getApproval(@Param('id') id: number, @CurrentUser() user: any) {
    const approval = await this.approvalsService.getApproval(id, user.somiteeId);
    return {
      success: true,
      statusCode: 200,
      message: 'Approval retrieved',
      data: approval,
    };
  }

  @Post()
  async createApproval(@Body() dto: CreateApprovalDto, @CurrentUser() user: any) {
    const approval = await this.approvalsService.createApproval(
      dto,
      user.id,
      user.name,
      user.somiteeId,
    );
    return {
      success: true,
      statusCode: 201,
      message: 'Submitted for approval',
      data: approval,
    };
  }

  @Patch(':id/approve')
  async approveApproval(
    @Param('id') id: number,
    @Body() dto: ApproveRejectDto,
    @CurrentUser() user: any,
  ) {
    const approval = await this.approvalsService.approveApproval(
      id,
      dto,
      user.id,
      user.name,
      user.somiteeId,
    );
    return {
      success: true,
      statusCode: 200,
      message: 'Approved',
      data: approval,
    };
  }

  @Patch(':id/reject')
  async rejectApproval(
    @Param('id') id: number,
    @Body() dto: ApproveRejectDto,
    @CurrentUser() user: any,
  ) {
    const approval = await this.approvalsService.rejectApproval(
      id,
      dto,
      user.id,
      user.name,
      user.somiteeId,
    );
    return {
      success: true,
      statusCode: 200,
      message: 'Rejected',
      data: approval,
    };
  }

  @Get('stats')
  async getApprovalStats(@CurrentUser() user: any) {
    const stats = await this.approvalsService.getApprovalStats(user.somiteeId);
    return {
      success: true,
      statusCode: 200,
      message: 'Stats retrieved',
      data: stats,
    };
  }
}
