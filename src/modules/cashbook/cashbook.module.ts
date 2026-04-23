import {Module} from '@nestjs/common';
import {CashbookController} from './cashbook.controller';
import {CashbookService} from './cashbook.service';
import {PrismaModule} from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CashbookController],
  providers: [CashbookService],
})
export class CashbookModule {}
