import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

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

export class GetReleaseAppsBranchesDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'encrypted token',
    default:
      '3bJyXEJA/FvAYWnbAIsj6T96+217WeqR4HpdmuNTGcG/dzYaOLjjWkz3bjR1NGYQqj8nMS8A6N91bnaCTveF0Q==',
  })
  token: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '한 페이지에 보여지는 브랜치 개수',
    default: 10,
  })
  per_page?: number | string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '페이지 번호',
    default: 1,
  })
  page?: number | string;
}

export class GetReleaseAppsVersionListDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'encrypted token',
    default:
      '3bJyXEJA/FvAYWnbAIsj6T96+217WeqR4HpdmuNTGcG/dzYaOLjjWkz3bjR1NGYQqj8nMS8A6N91bnaCTveF0Q==',
  })
  token: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '브랜치 이름',
    default: 'main',
  })
  branch?: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'software 이름',
    example: 'slamnav2, rrs-server, web-ui',
    default: 'slamnav2',
  })
  software: string;
}

export class CommitDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'commit sha',
  })
  sha: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'commit url',
  })
  url: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'commit name',
  })
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'commit protected',
  })
  protected: boolean;
}

export class ResponseReleaseAppsBranchesDto {
  commit: CommitDto;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'branch name',
  })
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'branch protected',
  })
  protected: boolean;
}

export class ResponseReleaseVersionInfoDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'version name',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'version path',
  })
  path: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'version sha',
  })
  sha: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'version size',
  })
  size: number;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'version url',
  })
  url: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'version download url',
  })
  download_url: string;

  @IsObject()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'version links',
  })
  _links: {
    self: string;
    html: string;
    git: string;
  };
}
