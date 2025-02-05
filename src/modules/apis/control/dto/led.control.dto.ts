import { IsArray, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {Expose} from 'class-transformer'

export class LedControlDto {
  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: 'on/off',
    example: 'on',
    required: true
  })
  @Expose()
  command: string;

  @IsString()
  @Length(1,50)
  @ApiProperty({
    description: 'LED 색상 (red,blue,white,green,magenta,yellow,red blink, blue blink, white blink, grren blink, magenta blink, yellow blink',
    example: 'red',
    required: true
  })
  @Expose()
  led: string;
}
