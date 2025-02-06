import { IsArray, IsNumber, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {Expose} from 'class-transformer'

export class MotorControlDto {
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: 'on/off',
    example: 'on',
    required: true
  })
  @Expose()
  command: string;

}
