import { Controller, Get, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AIModule } from './modules/ai/ai.module';
import { OverviewModule } from './modules/organizations/overview.module';
@Controller()
class HealthController {
  @Get('health') health() {
    return { status: 'ok', service: 'recruitflow-api' };
  }
}
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    JobsModule,
    ApplicationsModule,
    AIModule,
    OverviewModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
