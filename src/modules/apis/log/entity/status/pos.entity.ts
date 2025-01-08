import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

export class StatusPosEntity{
    @Column({name:'x', type: 'double'})
    x: number;

    @Column({name:'y', type: 'double'})
    y: number;

    @Column({name:'rz', type: 'double'})
    rz: number;

    @Column({name:'vx', type: 'double'})
    vx: number;

    @Column({name:'vy', type: 'double'})
    vy: number;

    @Column({name:'wz', type: 'double'})
    wz: number;
}