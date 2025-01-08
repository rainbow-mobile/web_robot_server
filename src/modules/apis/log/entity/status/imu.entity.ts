import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

// @Entity('ios')
export class StatusImuEntity{
    // @PrimaryColumn({name:'time', type: 'timestamp', default:()=>'CURRENT_TIMESTAMP'})
    // time: Date;

    @Column({name:'acc_x', type: 'double'})
    acc_x: number;

    @Column({name:'acc_y', type: 'double'})
    acc_y: number;

    @Column({name:'acc_z', type: 'double'})
    acc_z: number;

    @Column({name:'gyr_x', type: 'double'})
    gyr_x: number;

    @Column({name:'gyr_y', type: 'double'})
    gyr_y: number;

    @Column({name:'gyr_z', type: 'double'})
    gyr_z: number;

    @Column({name:'imu_rx', type: 'double'})
    imu_rx: number;
    
    @Column({name:'imu_ry', type: 'double'})
    imu_ry: number;

    @Column({name:'imu_rz', type: 'double'})
    imu_rz: number;
}