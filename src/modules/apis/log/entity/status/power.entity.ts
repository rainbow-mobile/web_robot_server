import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

export class StatusPowerEntity {
  @Column({ name: 'bat_in', type: 'double' })
  bat_in: number;

  @Column({ name: 'bat_out', type: 'double' })
  bat_out: number;

  @Column({ name: 'bat_current', type: 'double' })
  bat_current: number;

  @Column({ name: 'power', type: 'double' })
  power: number;

  @Column({ name: 'total_power', type: 'double' })
  total_power: number;

  @Column({ name: 'charge_current', type: 'double' })
  charge_current: number;

  @Column({ name: 'contact_voltage', type: 'double' })
  contact_voltage: number;
}
