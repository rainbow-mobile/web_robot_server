import { IsArray, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {Expose} from 'class-transformer'

export class PresetDto {
  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '선속도 제한',
    example: '1.5',
    required: true
  })
  @Expose()
  LIMIT_V: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '각속도 제한',
    example: '45.0',
    required: true
  })
  @Expose()
  LIMIT_W: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '선 가속도 제한',
    example: '0.5',
    required: true
  })
  @Expose()
  LIMIT_V_ACC: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '선 가속도 제한(DCC)',
    example: '0.5',
    required: true
  })
  @Expose()
  LIMIT_V_DCC: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '각 가속도 제한',
    example: '90.0',
    required: true
  })
  @Expose()
  LIMIT_W_ACC: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '도착 각속도 제한',
    example: '30.0',
    required: true
  })
  @Expose()
  LIMIT_PIVOT_W: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '주행 시작시점 속도',
    example: '0.1',
    required: true
  })
  @Expose()
  ST_V: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '주행 종료시점 속도',
    example: '0.1',
    required: true
  })
  @Expose()
  ED_V: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '주행 T',
    example: '0.0',
    required: true
  })
  @Expose()
  DRIVE_T: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '주행 H',
    example: '4.0',
    required: true
  })
  @Expose()
  DRIVE_H: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '주행 A',
    example: '0.8',
    required: true
  })
  @Expose()
  DRIVE_A: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '주행 B',
    example: '0.05',
    required: true
  })
  @Expose()
  DRIVE_B: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '주행 L',
    example: '0.5',
    required: true
  })
  @Expose()
  DRIVE_L: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '주행 K',
    example: '0.8',
    required: true
  })
  @Expose()
  DRIVE_K: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '주행 EPS',
    example: '0.3',
    required: true
  })
  @Expose()
  DRIVE_EPS: string;
}
