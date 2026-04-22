import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MemberRequestsController } from './member-requests.controller';
import { MemberRequestsService } from './member-requests.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: './uploads',
    })
  ],
  controllers: [MemberRequestsController],
  providers: [MemberRequestsService]
})
export class MemberRequestsModule {}
