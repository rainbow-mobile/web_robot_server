import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('alarm')
export class AlarmEntity{
    @PrimaryColumn({name:'alramCode', type: 'varchar', unique: true})
    alarmCode: string;

    @Column({name:'alarmDetail', type: 'varchar'})
    alarmDetail: string;

    @Column({name:'alarmDescription', type: 'varchar'})
    alarmDescription: string;

    @Column({name:'isError', type:'tinyint'})
    isError: boolean;
}