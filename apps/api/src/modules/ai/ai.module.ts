import { Body, Controller, Module, Post, UseGuards } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user';
import { AIProvider, MockAIProvider } from './ai.provider';
import { AIService } from './ai.service';
class AnalysisDto {
  @ApiProperty() @IsUUID() applicationId!: string;
}
@Controller('ai')
@UseGuards(AuthGuard)
class AIController {
  constructor(private readonly ai: AIService) {}
  @Post('resume-analysis') analyze(
    @CurrentUser() userId: string,
    @Body() dto: AnalysisDto,
  ) {
    return this.ai.analyze(userId, dto.applicationId);
  }
}
@Module({
  controllers: [AIController],
  providers: [AIService, { provide: AIProvider, useClass: MockAIProvider }],
})
export class AIModule {}
