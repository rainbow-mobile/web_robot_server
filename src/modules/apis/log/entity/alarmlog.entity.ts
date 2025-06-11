import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('alarmLog')
export class AlarmLogEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name:'alarmCode', type: 'varchar'})
    alarmCode: string;

    @Column({name:'state'})
    state: boolean;

    @Column({name:'emitFlag'})
    emitFlag: boolean;

    @Column({name:'time', type: 'timestamp', default:()=>'CURRENT_TIMESTAMP'})
    time: Date;
}