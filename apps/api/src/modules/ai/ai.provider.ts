import { Injectable } from '@nestjs/common';
export interface AnalysisResult {
  demonstration: boolean;
  provider: string;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
}
export interface AnalysisInput {
  jobTitle: string;
  requirements: string;
  resumeData: unknown;
}
export abstract class AIProvider {
  abstract analyze(input: AnalysisInput): Promise<AnalysisResult>;
}
@Injectable()
export class MockAIProvider implements AIProvider {
  async analyze(): Promise<AnalysisResult> {
    return {
      demonstration: true,
      provider: 'mock',
      summary:
        'DEMONSTRATION ONLY: This is synthetic example output. No resume was read or analyzed. A recruiter must assess the actual application.',
      matchedSkills: ['Example: TypeScript'],
      missingSkills: ['Example: PostgreSQL experience requires human review'],
    };
  }
}
