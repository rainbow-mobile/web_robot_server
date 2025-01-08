import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

export class StatusConditionEntity{
    @Column({name:'state', type: 'varchar', length: 32})
    state: string;

    @Column({name:'auto_state', type: 'varchar', length: 32})
    auto_state: string;

    @Column({name:'obs_state', type: 'varchar', length: 32})
    obs_state: string;

    @Column({name:'inlier_ratio', type: 'double'})
    inlier_ratio: number;

    @Column({name:'inlier_error', type: 'double'})
    inlier_error: number;
}