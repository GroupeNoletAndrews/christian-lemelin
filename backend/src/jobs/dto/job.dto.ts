import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export const JOB_TYPES = ['full-time', 'part-time', 'contract'] as const;
export type JobType = (typeof JOB_TYPES)[number];

export class CreateJobDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsString()
  @MinLength(1)
  location!: string;

  @IsIn(JOB_TYPES)
  type!: JobType;

  @IsString()
  @MinLength(1)
  department!: string;

  @IsOptional()
  @IsString()
  salary?: string;
}

export class UpdateJobDto extends CreateJobDto {}
