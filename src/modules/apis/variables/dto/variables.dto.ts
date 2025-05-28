import {
  IsArray,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class VariableDto {
  @IsString()
  @Length(1, 127)
  @ApiProperty({
    required: true,
    description: '키 값',
  })
  @Expose()
  key: string;

  @IsString()
  @Length(1, 127)
  @ApiProperty({
    required: true,
    description: '데이터 값',
  })
  @Expose()
  value: string;
}
