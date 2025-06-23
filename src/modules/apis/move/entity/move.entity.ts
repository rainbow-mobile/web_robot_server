import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('move')
export class MoveLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'command' })
  command: string;

  @Column({ name: 'goal_id' })
  goal_id: string;

  @Column({ name: 'map_name' })
  map_name: string;

  @Column({ name: 'goal_name' })
  goal_name: string;

  @Column({ name: 'x', type: 'float' })
  x: number;
  @Column({ name: 'y', type: 'float' })
  y: number;
  @Column({ name: 'rz', type: 'float' })
  rz: number;

  @Column({
    name: 'time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  time: Date;
}
