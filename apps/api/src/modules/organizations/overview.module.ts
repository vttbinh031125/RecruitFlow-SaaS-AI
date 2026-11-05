import {
  Controller,
  Get,
  Module,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from './organizations.module';
import { ApplicationStatus } from '../../generated/prisma/enums';
@Controller('organizations/:organizationId/overview')
@UseGuards(AuthGuard)
class OverviewController {
  constructor(
    private readonly db: PrismaService,
    private readonly organizations: OrganizationsService,
  ) {}
  @Get() async overview(
    @CurrentUser() userId: string,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    await this.organizations.requireRecruiter(userId, organizationId);
    const stages = Object.values(ApplicationStatus);
    const [jobs, publishedJobs, applications, ...counts] =
      await this.db.$transaction([
        this.db.job.count({ where: { organizationId } }),
        this.db.job.count({ where: { organizationId, status: 'PUBLISHED' } }),
        this.db.application.count({ where: { job: { organizationId } } }),
        ...stages.map((status) =>
          this.db.application.count({
            where: { status, job: { organizationId } },
          }),
        ),
      ]);
    return {
      jobs,
      publishedJobs,
      applications,
      stages: stages.map((status, index) => ({
        status,
        count: counts[index],
      })),
    };
  }
}
@Module({ controllers: [OverviewController] })
export class OverviewModule {}
