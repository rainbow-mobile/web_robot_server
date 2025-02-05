import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

// @Entity('states')
export class StatusStateEntity{
    // @PrimaryColumn({name:'time', type: 'timestamp', default:()=>'CURRENT_TIMESTAMP'})
    // time: Date;

    @Column({name:'charge', type: 'varchar', length: 32})
    charge: string;

    @Column({name:'dock', type: 'varchar', length: 32})
    dock: string;

    @Column({name:'localization', type: 'varchar', length: 32})
    localization: string;

    @Column({name:'power', type: 'boolean'})
    power: boolean;
}