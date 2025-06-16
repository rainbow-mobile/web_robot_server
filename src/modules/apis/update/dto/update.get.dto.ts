import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetSoftwareParamDto {
  @IsString()
  @ApiProperty({
    description: '소프트웨어 종류 (예: rrs, slamnav2)',
    example: 'slamnav2',
  })
  software: string;
}

export class GetNewVersionDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '브랜치 이름',
    default: 'main',
  })
  branch?: string;
}
