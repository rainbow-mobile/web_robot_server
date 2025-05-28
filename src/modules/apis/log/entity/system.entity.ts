import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { StatusConditionEntity } from './status/condition.entity';
import { StatusStateEntity } from './status/state.entity';
import { StatusMotorEntity } from './status/motor.entity';
import { StatusImuEntity } from './status/imu.entity';
import { StatusPowerEntity } from './status/power.entity';
import { StatusPosEntity } from './status/pos.entity';
import { StatusTaskEntity } from './status/task.entity';
import {
  NetworkUsagePayload,
  ProcessUsagePayload,
} from '@common/interface/system/usage.interface';

@Entity('system')
export class SystemLogEntity {
  @ApiProperty({
    example: new Date(),
  })
  @PrimaryColumn({
    name: 'time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  time: Date;

  @ApiProperty({
    example: 0,
    description: 'CPU 총 사용량(%)',
  })
  @Column({ name: 'cpu', type: 'float' })
  cpu: number;

  @ApiProperty({
    example: 0,
    description: 'CPU 코어 별 사용량(%)',
  })
  @Column({ name: 'cpu_cores', type: 'json' })
  cpu_cores: number[];

  @ApiProperty({
    example: 0,
    description: '메모리 총량 (GB)',
  })
  @Column({ name: 'memory_total', type: 'float' })
  memory_total: number;

  @ApiProperty({
    example: 0,
    description: '메모리 여분량 (GB)',
  })
  @Column({ name: 'memory_free', type: 'float' })
  memory_free: number;

  @ApiProperty({
    example: [],
    description: '네트워크 사용량',
  })
  @Column({ name: 'network', type: 'json' })
  network: any;

  @ApiProperty({
    example: [],
    description: 'RRS 시스템자원 사용량',
  })
  @Column({ name: 'server', type: 'json' })
  server: ProcessUsagePayload;

  @ApiProperty({
    example: [],
    description: 'RRS UI 시스템자원 사용량',
  })
  @Column({ name: 'webui', type: 'json' })
  webui: ProcessUsagePayload;

  @ApiProperty({
    example: [],
    description: 'SLAMNAV2 시스템자원 사용량',
  })
  @Column({ name: 'slamnav', type: 'json' })
  slamnav: ProcessUsagePayload;

  @ApiProperty({
    example: [],
    description: 'TaskMan 시스템자원 사용량',
  })
  @Column({ name: 'taskman', type: 'json' })
  taskman: ProcessUsagePayload;
}
