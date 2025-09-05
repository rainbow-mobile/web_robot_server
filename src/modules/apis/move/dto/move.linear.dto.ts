import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';

enum LinearMoveCommand {
    linearXMove = 'linearXMove',
    circularMove = 'circularMove',
    rotateMove = 'rotateMove',
    linearStop = 'linearStop'
}

export class MoveLinearRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Linear Move 명령구분',
    example: LinearMoveCommand.linearXMove,
    enum: LinearMoveCommand,
  })
  command: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'linearXMove 이동거리 [m] | circularMove 이동거리 [deg] | rotateMove 이동거리 [deg]',
    example: 0,
  })
  @Expose()
  target?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'linearXMove 이동속도 [m/s] | circularMove 이동속도 [deg/s] | rotateMove 이동속도 [deg/s]',
    example: 0,
  })
  @Expose()
  speed?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'circularMove 방향 [left, right]',
    enum: ['left', 'right'],
    example: 'left',
  })
  @Expose()
  direction?: 'left' | 'right';
}