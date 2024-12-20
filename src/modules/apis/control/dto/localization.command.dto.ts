import { IsArray, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {Expose} from 'class-transformer'

export class LocalizationDto {
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: 'Localization 명령',
    example: 'init',
    required: true
  })
  @Expose()
  command: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: 'Target X (command == init)',
    example: '0'
  })
  @Expose()
  x: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: 'Target Y (command == init)',
    example: '0'
  })
  @Expose()
  y: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: 'Target Z (command == init)',
    example: '0'
  })
  @Expose()
  z: string;

  @IsOptional()
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: 'Target RZ (command == init)',
    example: '0'
  })
  @Expose()
  rz: string;
}
