import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export enum MoveCommand {
  goal = 'goal',
  target = 'target',
  jog = 'jog',
  stop = 'stop',
  pause = 'pause',
  resume = 'resume',
  linearXMove = 'linearXMove',
  circularMove = 'circularMove',
  rotateMove = 'rotateMove',
  linearStop = 'linearStop',
}

export class MoveCommandDto {
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'Move 명령',
    example: MoveCommand.goal,
    enum: MoveCommand,
    required: true,
  })
  @Expose()
  command: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  @ApiProperty({
    description: 'Goal ID (command == goal)',
    example: '',
  })
  @Expose()
  goal_id?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  @ApiProperty({
    description: 'Goal NAME (command == goal)',
    example: '',
  })
  @Expose()
  goal_name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  @ApiProperty({
    description: 'Map NAME',
    example: '',
  })
  @Expose()
  map_name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '주행 Method',
    example: 'pp',
  })
  @Expose()
  method?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '속도 Preset',
    example: '0',
  })
  @Expose()
  preset?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'Target X (command == target)',
    example: '0',
  })
  @Expose()
  x?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'Target Y (command == target)',
    example: '0',
  })
  @Expose()
  y?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'Target Z (command == target)',
    example: '0',
  })
  @Expose()
  z?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'Target RZ (command == target)',
    example: '0',
  })
  @Expose()
  rz?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'Target VX (command == jog)',
    example: '0',
  })
  @Expose()
  vx?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'Target VY (command == jog)',
    example: '0',
  })
  @Expose()
  vy?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'Target WZ (command == jog)',
    example: '0',
  })
  @Expose()
  wz?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description:
      'linearXMove 이동거리 [m] | circularMove 이동거리 [deg] | rotateMove 이동거리 [deg]',
    example: 0,
  })
  @Expose()
  target?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description:
      'linearXMove 이동속도 [m/s] | circularMove 이동속도 [deg/s] | rotateMove 이동속도 [deg/s]',
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
