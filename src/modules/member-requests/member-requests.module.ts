import { Module } from '@nestjs/common';
import { MemberRequestsController } from './member-requests.controller';
import { MemberRequestsService } from './member-requests.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MemberRequestsController],
  providers: [MemberRequestsService]
})
export class MemberRequestsModule {}
