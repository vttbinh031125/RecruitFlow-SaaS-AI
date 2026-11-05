import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.module';
import { CreateJobDto, UpdateJobDto } from './jobs.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
const jobSelect = {
  id: true,
  organizationId: true,
  title: true,
  description: true,
  requirements: true,
  location: true,
  employmentType: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  organization: { select: { name: true, slug: true } },
} as const;
@Injectable()
export class JobsService {
  constructor(
    private readonly db: PrismaService,
    private readonly organizations: OrganizationsService,
  ) {}
  list(q: PaginationDto, organizationId?: string) {
    return this.db.job.findMany({
      where: organizationId ? { organizationId } : { status: 'PUBLISHED' },
      select: jobSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    });
  }
  detail(id: string) {
    return this.db.job.findFirstOrThrow({
      where: { id, status: 'PUBLISHED' },
      select: jobSelect,
    });
  }
  async create(userId: string, dto: CreateJobDto) {
    await this.organizations.requireRecruiter(userId, dto.organizationId);
    return this.db.job.create({ data: dto, select: jobSelect });
  }
  async update(userId: string, id: string, dto: UpdateJobDto) {
    const job = await this.db.job.findUniqueOrThrow({
      where: { id },
      select: { organizationId: true },
    });
    await this.organizations.requireRecruiter(userId, job.organizationId);
    if (dto.organizationId && dto.organizationId !== job.organizationId)
      throw new BadRequestException('Jobs cannot move between organizations');
    return this.db.job.update({
      where: { id, organizationId: job.organizationId },
      data: dto,
      select: jobSelect,
    });
  }
  async remove(userId: string, id: string) {
    const job = await this.db.job.findUniqueOrThrow({
      where: { id },
      select: { organizationId: true },
    });
    await this.organizations.requireRecruiter(userId, job.organizationId);
    return this.db.job.delete({
      where: { id, organizationId: job.organizationId },
      select: { id: true },
    });
  }
}
