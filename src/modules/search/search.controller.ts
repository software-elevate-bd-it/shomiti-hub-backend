import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  async search(@CurrentUser('somiteeId') somiteeId: string, @Query() query: any) {
    return this.service.search(somiteeId, query);
  }
}
