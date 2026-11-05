import {
  Body,
  Controller,
  Get,
  Module,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApplicationsService } from './applications.service';
import { UpdateApplicationDto } from './applications.dto';
@Controller()
@UseGuards(AuthGuard)
class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}
  @Post('jobs/:jobId/applications') apply(
    @CurrentUser() userId: string,
    @Param('jobId', ParseUUIDPipe) id: string,
  ) {
    return this.applications.apply(userId, id);
  }
  @Get('applications/me') mine(
    @CurrentUser() userId: string,
    @Query() q: PaginationDto,
  ) {
    return this.applications.mine(userId, q);
  }
  @Get('organizations/:organizationId/applications') list(
    @CurrentUser() userId: string,
    @Param('organizationId', ParseUUIDPipe) id: string,
    @Query() q: PaginationDto,
  ) {
    return this.applications.forOrganization(userId, id, q);
  }
  @Patch('applications/:id/status') update(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applications.updateStatus(userId, id, dto.status);
  }
}
@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
