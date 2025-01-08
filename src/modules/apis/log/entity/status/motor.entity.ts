import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

// @Entity('ios')
export class StatusMotorEntity{
    @Column({name:'connection', type: 'boolean'})
    connection: boolean;

    @Column({name:'current', type: 'double'})
    current: number;

    @Column({name:'status', type: 'int'})
    status: number;

    @Column({name:'temp', type: 'double'})
    temp: number;
}