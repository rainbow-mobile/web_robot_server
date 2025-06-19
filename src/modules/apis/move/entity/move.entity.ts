import { Entity, Column, PrimaryColumn, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('move')
export class MoveLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({name: 'command'})
  command: string;

  @Column({name: 'goal_id'})
  goal_id: string;

  @Column({name: 'x'})
  x: number;
  @Column({name: 'y'})
  y: number;
  @Column({name: 'rz'})
  rz: number;

  @Column({
    name: 'time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  time: Date;
    
}