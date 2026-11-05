import {
  Body,
  Controller,
  Delete,
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
import { OrganizationsService } from '../organizations/organizations.module';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './jobs.dto';
@Controller('jobs')
class JobsController {
  constructor(private readonly jobs: JobsService) {}
  @Get() list(@Query() q: PaginationDto) {
    return this.jobs.list(q);
  }
  @Get(':id') detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobs.detail(id);
  }
  @Post() @UseGuards(AuthGuard) create(
    @CurrentUser() userId: string,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobs.create(userId, dto);
  }
  @Patch(':id') @UseGuards(AuthGuard) update(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobs.update(userId, id, dto);
  }
  @Delete(':id') @UseGuards(AuthGuard) remove(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.jobs.remove(userId, id);
  }
}
@Controller('organizations/:organizationId/jobs')
@UseGuards(AuthGuard)
class OrganizationJobsController {
  constructor(
    private readonly jobs: JobsService,
    private readonly organizations: OrganizationsService,
  ) {}
  @Get() async list(
    @CurrentUser() userId: string,
    @Param('organizationId', ParseUUIDPipe) id: string,
    @Query() q: PaginationDto,
  ) {
    await this.organizations.requireRecruiter(userId, id);
    return this.jobs.list(q, id);
  }
}
@Module({
  controllers: [JobsController, OrganizationJobsController],
  providers: [JobsService],
})
export class JobsModule {}
