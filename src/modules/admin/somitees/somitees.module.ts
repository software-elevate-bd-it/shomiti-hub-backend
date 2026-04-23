import {Module} from '@nestjs/common';
import {SomiteesController} from './somitees.controller';
import {SomiteesService} from './somitees.service';
import {PrismaModule} from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SomiteesController],
  providers: [SomiteesService],
})
export class SomiteesModule {}
