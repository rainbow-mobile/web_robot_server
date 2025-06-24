import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

export class PingSendToTargetDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: '타겟 호스트',
    default: '192.168.1.1',
  })
  target: string;
}
