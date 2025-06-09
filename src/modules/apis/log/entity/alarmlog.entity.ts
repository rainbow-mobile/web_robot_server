import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('alarmLog')
export class AlarmLogEntity{
    @PrimaryColumn({name:'time', type: 'timestamp', default:()=>'CURRENT_TIMESTAMP'})
    time: Date;
    
    @Column({name:'alramCode', type: 'varchar'})
    alarmCode: string;

    @Column({name:'state', type: 'tinyint'})
    state: boolean;
}