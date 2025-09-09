import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReqUpdateSoftwareDto {
  @ApiProperty({
    description: '업데이트할 소프트웨어 종류 (예: rrs-server, slamnav2)',
    example: 'slamnav2',
    default: 'slamnav2',
  })
  @IsString()
  @IsNotEmpty()
  software: string;

  @ApiProperty({
    description: '업데이트할 브랜치 이름',
    example: 'main',
    default: 'main',
  })
  @IsString()
  @IsNotEmpty()
  branch: string;

  @ApiProperty({
    description: '업데이트할 로봇 타입',
    example: 'S100-A',
    default: '',
  })
  @IsString()
  @IsOptional()
  robotType?: string;

  @ApiProperty({
    description: '업데이트할 버전 이름',
    example: '1.2.4',
    default: '',
  })
  @IsString()
  @IsOptional()
  version?: string;
}

export class WebUIAppAddDto {
  @ApiProperty({
    description: '앱 이름 배열',
    example: ['app1', 'app2'],
  })
  @IsArray()
  @IsNotEmpty()
  appNames: string[];

  @ApiProperty({
    description: '브랜치 이름',
    example: 'main',
  })
  @IsString()
  @IsOptional()
  branch?: string;

  @ApiProperty({
    description: '로봇 UI에 노출할 첫페이지 URL',
    example: '/S100',
  })
  @IsString()
  @IsOptional()
  fo?: string;
}

export class WebUIAppDeleteDto {
  @ApiProperty({
    description: '앱 이름 배열',
    example: ['app1', 'app2'],
  })
  @IsArray()
  @IsNotEmpty()
  appNames: string[];
}

export class ResponseWebUIAppAddDto {
  @ApiProperty({
    description: '추가한 앱 이름 배열',
    example: ['app1', 'app2'],
  })
  @IsArray()
  @IsNotEmpty()
  appNames: string[];

  @ApiProperty({
    description: '브랜치 이름',
    example: 'main',
  })
  @IsString()
  @IsNotEmpty()
  branch: string;

  @ApiProperty({
    description: '로봇 UI에 노출할 첫페이지 URL',
    example: '/S100',
  })
  @IsString()
  @IsNotEmpty()
  fo: string;
}

export class ResponseWebUIAppDeleteDto {
  @ApiProperty({
    description: '삭제한 앱 이름 배열',
    example: ['app1', 'app2'],
  })
  @IsArray()
  @IsNotEmpty()
  appNames: string[];
}
