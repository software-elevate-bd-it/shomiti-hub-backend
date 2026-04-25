import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiOperation} from '@nestjs/swagger';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {CurrentUser} from '../../common/decorators/user.decorator';
import {SearchService} from './search.service';
import {SearchDto} from './dto/search.dto';

@ApiTags('Search')
@ApiBearerAuth('Authorization')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({summary: 'Global search'})
  async search(@CurrentUser('somiteeId') somiteeId: number, @Query() query: SearchDto) {
    return this.service.search(somiteeId, query);
  }
}
