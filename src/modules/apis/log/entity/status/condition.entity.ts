import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

export class StatusConditionEntity {
  @Column({ name: 'inlier_ratio', type: 'double' })
  inlier_ratio: number;

  @Column({ name: 'inlier_error', type: 'double' })
  inlier_error: number;
}
