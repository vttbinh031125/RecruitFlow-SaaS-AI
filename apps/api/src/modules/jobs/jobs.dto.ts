import { IsEnum, ValidateIf, IsString, IsUUID, Length } from 'class-validator';
import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentType, JobStatus } from '../../generated/prisma/enums';
export class CreateJobDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  organizationId!: string;
  @ApiProperty()
  @IsString()
  @Length(2, 160)
  title!: string;
  @ApiProperty()
  @IsString()
  @Length(10, 20000)
  description!: string;
  @ApiProperty()
  @IsString()
  @Length(2, 10000)
  requirements!: string;
  @ApiProperty()
  @IsString()
  @Length(2, 160)
  location!: string;
  @ApiProperty({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  employmentType!: EmploymentType;
  @ApiPropertyOptional({ enum: JobStatus })
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(JobStatus)
  status?: JobStatus;
}
export class UpdateJobDto extends PartialType(CreateJobDto, {
  skipNullProperties: false,
}) {}
