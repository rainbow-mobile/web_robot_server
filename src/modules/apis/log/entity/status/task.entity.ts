import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

export class StatusTaskEntity {
  @Column({ name: 'connection', type: 'boolean' })
  connection: boolean;

  @Column({ name: 'file', type: 'varchar', length: 32 })
  file: string;

  @Column({ name: 'running', type: 'boolean' })
  running: boolean;

  @Column({ name: 'id', type: 'int' })
  id: number;
}
