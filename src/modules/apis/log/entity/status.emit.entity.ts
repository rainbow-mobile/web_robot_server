import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { StatusConditionEntity } from "./status/condition.entity";
import { StatusStateEntity } from "./status/state.entity";
import { StatusMotorEntity } from "./status/motor.entity";
import { StatusImuEntity } from "./status/imu.entity";
import { StatusPowerEntity } from "./status/power.entity";
import { StatusPosEntity } from "./status/pos.entity";
import { StatusTaskEntity } from "./status/task.entity";

@Entity('status')
export class StatusLogEntity{
    @PrimaryColumn({name:'time', type: 'timestamp', default:()=>'CURRENT_TIMESTAMP'})
    time: Date;

    @Column({name:'slam', type: 'boolean'})
    slam:boolean;

    @Column({name:'type', type:'varchar', length:32})
    type:string;

    @Column({name:'conditions', type: 'json'})
    conditions: StatusConditionEntity;

    @Column({name:'state', type: 'json'})
    state: StatusStateEntity;

    @Column({name:'motor0', type:'json'})
    motor0: StatusMotorEntity;

    @Column({name:'motor1', type:'json'})
    motor1: StatusMotorEntity;

    @Column({name:'imu', type: 'json'})
    imu: StatusImuEntity;

    @Column({name:'power', type: 'json'})
    power: StatusPowerEntity;

    @Column({name:'pose', type: 'json'})
    pose: StatusPosEntity;

    @Column({name:'task', type:'json'})
    task: StatusTaskEntity;
}