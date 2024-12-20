import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('state')
export class StateLogEntity{
    @PrimaryColumn({name:'time', type: 'timestamp', default:()=>'CURRENT_TIMESTAMP'})
    time: Date;

    @Column({name:'state', type: 'varchar', length: 32})
    state: string;

    @Column({name:'auto_state', type: 'varchar', length: 32})
    auto_state: string;

    @Column({name:'localization', type: 'varchar', length: 32})
    localization: string;

    @Column({name:'obs_state', type: 'varchar', length: 32})
    obs_state: string;

    @Column({name:'charging', type: 'varchar', length: 32})
    charging: string;

    @Column({name:'power', type: 'tinyint'})
    power: boolean;

    @Column({name:'emo', type: 'tinyint'})
    emo: boolean;

    @Column({name:'dock', type: 'tinyint'})
    dock: boolean;

    @Column({name:'inlier_ratio', type: 'double'})
    inlier_ratio: number;

    @Column({name:'inlier_error', type: 'double'})
    inlier_error: number;
}