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
    @ApiProperty({
        example:new Date()
    })
    @PrimaryColumn({name:'time', type: 'timestamp', default:()=>'CURRENT_TIMESTAMP'})
    time: Date;

    @ApiProperty({
        example:false
    })
    @Column({name:'slam', type: 'boolean'})
    slam:boolean;

    @ApiProperty({
        example:''
    })
    @Column({name:'type', type:'varchar', length:32})
    type:string;

    @ApiProperty({
        example:{
            
        }
    })
    @Column({name:'conditions', type: 'json'})
    conditions: StatusConditionEntity;

    @ApiProperty({
        example:{}
    })
    @Column({name:'state', type: 'json'})
    state: StatusStateEntity;

    @ApiProperty({
        example:{}
    })
    @Column({name:'motor0', type:'json'})
    motor0: StatusMotorEntity;

    @ApiProperty({
        example:{}
    })
    @Column({name:'motor1', type:'json'})
    motor1: StatusMotorEntity;

    @ApiProperty({
        example:{}
    })
    @Column({name:'imu', type: 'json'})
    imu: StatusImuEntity;

    @ApiProperty({
        example:{}
    })
    @Column({name:'power', type: 'json'})
    power: StatusPowerEntity;

    @ApiProperty({
        example:{}
    })
    @Column({name:'pose', type: 'json'})
    pose: StatusPosEntity;

    @ApiProperty({
        example:{}
    })
    @Column({name:'task', type:'json'})
    task: StatusTaskEntity;
}