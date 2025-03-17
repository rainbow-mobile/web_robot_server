import { IsEnum, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export enum MotionCommand {
  MOTION_GATE = 'motionGate',
}

export enum MotionMethod {
  SITTING = 'sitting',
  STANDING = 'standing',
  AIMING = 'aiming',
  TROTTING = 'trotting',
  TROT_STAIRS = 'trot_stairs',
  WAVING = 'waving',
  TROT_RUNNING = 'trot_running',
  DOOR_OPENING = 'door_opening',
  ZMP_INITIALIZING = 'zmp_initializing',
}

export class MotionCommandDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(MotionCommand, { message: 'Invalid motion command' })
  @ApiProperty({ description: 'motion 명령' })
  command: 'motionGate';

  @IsNotEmpty()
  @IsString()
  @IsEnum(MotionMethod, { message: 'Invalid motion method' })
  @ApiProperty({ description: 'motion 명령' })
  method:
    | 'sitting'
    | 'standing'
    | 'aiming'
    | 'trotting'
    | 'trot_stairs'
    | 'waving'
    | 'trot_running'
    | 'door_opening'
    | 'zmp_initializing';
}
