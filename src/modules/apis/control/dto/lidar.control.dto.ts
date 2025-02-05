import { IsArray, IsNumber, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {Expose} from 'class-transformer'

export class LidarControlDto {
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: 'on/off',
    example: 'on',
    required: true
  })
  @Expose()
  command: string;

  @IsNumber()
  @ApiProperty({
    description: '전송 주기(Hz)',
    example: 1,
    required: true
  })
  @Expose()
  frequency: number;
}
