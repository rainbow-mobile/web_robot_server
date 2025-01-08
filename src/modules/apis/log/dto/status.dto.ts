import { IsArray, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {Expose} from 'class-transformer'

export class StatusTestDto {
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: '로그 시간',
    example: '2024-11-30 09:00:00.000',
    required: true
  })
  @Expose()
  time: string;
}
