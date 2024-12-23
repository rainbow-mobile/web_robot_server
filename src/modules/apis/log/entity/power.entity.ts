import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('power')
export class PowerLogEntity{
    @PrimaryColumn({name:'time', type: 'timestamp', default:()=>'CURRENT_TIMESTAMP'})
    time?: Date;

    @Column({name:'battery_in', type: 'double'})
    battery_in: number;

    @Column({name:'battery_out', type: 'double'})
    battery_out: number;

    @Column({name:'battery_current', type: 'double'})
    battery_current: number;

    @Column({name:'power', type: 'double'})
    power: number;

    @Column({name:'total_power', type: 'double'})
    total_power: number;

    @Column({name:'motor0_temp', type: 'double'})
    motor0_temp: number;

    @Column({name:'motor0_current', type: 'double'})
    motor0_current: number;

    @Column({name:'motor0_status', type: 'int'})
    motor0_status: number;

    @Column({name:'motor1_temp', type: 'double'})
    motor1_temp: number;

    @Column({name:'motor1_current', type: 'double'})
    motor1_current: number;

    @Column({name:'motor1_status', type: 'int'})
    motor1_status: number;
    
    @Column({name:'charge_current', type: 'double'})
    charge_current: number;

    @Column({name:'contact_voltage', type: 'double'})
    contact_voltage: number;
}