import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SetSafetyFieldDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    description: '',
    example: 0,
  })
  field: number;
}
