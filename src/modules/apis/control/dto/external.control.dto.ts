import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export enum FootCommand {
  Move = 'footMove',
  Stop = 'footStop',
}
export class ExternalCommandDto {
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    enum: FootCommand,
    example: FootCommand.Move,
    description:
      '전달할 명령을 입력하세요. Foot명령의 경우 footMove, footStop이 있습니다.',
  })
  command: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: '이동할 위치값을 입력하세요.',
    required: false,
  })
  pose?: number;
}
