import { IsArray, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CommandDto {
  @IsString()
  @ApiProperty({
    description: '',
    example: 'ifconfig',
  })
  command:string;
}
