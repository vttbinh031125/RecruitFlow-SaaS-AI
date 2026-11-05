import {
  Controller,
  ForbiddenException,
  Get,
  Global,
  Injectable,
  Module,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user';
@Injectable()
export class OrganizationsService {
  constructor(private readonly db: PrismaService) {}
  async requireRecruiter(userId: string, organizationId: string) {
    const member = await this.db.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
    if (!member || !['OWNER', 'RECRUITER'].includes(member.role))
      throw new ForbiddenException('Organization access denied');
    return member;
  }
  mine(userId: string) {
    return this.db.organizationMember.findMany({
      where: { userId },
      select: {
        role: true,
        organization: { select: { id: true, name: true, slug: true } },
      },
    });
  }
}
@Controller('organizations')
@UseGuards(AuthGuard)
class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}
  @Get() mine(@CurrentUser() userId: string) {
    return this.organizations.mine(userId);
  }
}
@Global()
@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
