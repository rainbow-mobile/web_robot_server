import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class ResetSafetyFlagDto {
  @IsString()
  @ApiProperty({
    description: '리셋할 플래그 이름을 입력하세요.',
    example: 'bumper',
    enum: ['bumper', 'interlock', 'obstacle', 'operationStop'],
  })
  reset_flag: string;
}
