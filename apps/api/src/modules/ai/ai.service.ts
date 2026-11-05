import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.module';
import { AIProvider } from './ai.provider';
@Injectable()
export class AIService {
  constructor(
    private readonly db: PrismaService,
    private readonly organizations: OrganizationsService,
    private readonly provider: AIProvider,
  ) {}
  async analyze(userId: string, applicationId: string) {
    const application = await this.db.application.findUniqueOrThrow({
      where: { id: applicationId },
      select: { job: { select: { organizationId: true } } },
    });
    await this.organizations.requireRecruiter(
      userId,
      application.job.organizationId,
    );
    const context = await this.db.application.findFirstOrThrow({
      where: {
        id: applicationId,
        job: { organizationId: application.job.organizationId },
      },
      select: {
        job: { select: { title: true, requirements: true } },
        candidate: {
          select: {
            resumes: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { parsedData: true },
            },
          },
        },
      },
    });
    const result = await this.provider.analyze({
      jobTitle: context.job.title,
      requirements: context.job.requirements,
      resumeData: context.candidate.resumes[0]?.parsedData ?? null,
    });
    const saved = await this.db.aIAnalysis.create({
      data: {
        applicationId,
        summary: result.summary,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
      },
      select: { id: true, createdAt: true },
    });
    return { ...saved, ...result };
  }
}
