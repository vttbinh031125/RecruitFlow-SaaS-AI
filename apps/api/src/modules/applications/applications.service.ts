import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.module';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApplicationStatus } from '../../generated/prisma/enums';
export const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ['SCREENING', 'REJECTED'],
  SCREENING: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFER', 'REJECTED'],
  OFFER: ['HIRED', 'REJECTED'],
  HIRED: [],
  REJECTED: [],
};
const selection = {
  id: true,
  status: true,
  appliedAt: true,
  updatedAt: true,
  job: { select: { id: true, title: true, organizationId: true } },
  candidate: {
    select: { id: true, user: { select: { fullName: true, email: true } } },
  },
} as const;
@Injectable()
export class ApplicationsService {
  constructor(
    private readonly db: PrismaService,
    private readonly organizations: OrganizationsService,
  ) {}
  async apply(userId: string, jobId: string) {
    return this.db.$transaction(async (tx) => {
      const candidate = await tx.candidate.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!candidate)
        throw new ForbiddenException('Candidate profile required');
      await tx.job.findFirstOrThrow({
        where: { id: jobId, status: 'PUBLISHED' },
        select: { id: true },
      });
      return tx.application.create({
        data: { jobId, candidateId: candidate.id },
        select: { id: true, jobId: true, status: true, appliedAt: true },
      });
    });
  }
  async mine(userId: string, q: PaginationDto) {
    return (
      await this.db.application.findMany({
        where: { candidate: { userId } },
        select: selection,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: [{ appliedAt: 'desc' }, { id: 'desc' }],
      })
    ).map((row) => ({ ...row, allowedNextStatuses: transitions[row.status] }));
  }
  async forOrganization(
    userId: string,
    organizationId: string,
    q: PaginationDto,
  ) {
    await this.organizations.requireRecruiter(userId, organizationId);
    return (
      await this.db.application.findMany({
        where: { job: { organizationId } },
        select: selection,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: [{ appliedAt: 'desc' }, { id: 'desc' }],
      })
    ).map((row) => ({ ...row, allowedNextStatuses: transitions[row.status] }));
  }
  async updateStatus(userId: string, id: string, status: ApplicationStatus) {
    return this.db.$transaction(async (tx) => {
      const application = await tx.application.findUniqueOrThrow({
        where: { id },
        select: { status: true, job: { select: { organizationId: true } } },
      });
      const member = await tx.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: application.job.organizationId,
          },
        },
      });
      if (!member || !['OWNER', 'RECRUITER'].includes(member.role))
        throw new ForbiddenException('Organization access denied');
      if (!transitions[application.status].includes(status))
        throw new BadRequestException('Invalid application stage transition');
      const result = await tx.application.updateMany({
        where: { id, status: application.status },
        data: { status, updatedAt: new Date() },
      });
      if (result.count !== 1)
        throw new ConflictException('Application changed; reload and retry');
      return tx.application.findUniqueOrThrow({
        where: { id },
        select: selection,
      });
    });
  }
}
