import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

// @Entity('states')
export class MoveStatusStateEntity{
    @Column({name:'state', type:'varchar',length:32})
    state:string;

    @Column({name:'auto_move', type: 'varchar', length: 32})
    auto_move: string;

    @Column({name:'dock_move', type: 'varchar', length: 32})
    dock_move: string;

    @Column({name:'jog_move', type: 'varchar', length: 32})
    jog_move: string;

    @Column({name:'obs', type: 'varchar', length: 32})
    obs: string;

    @Column({name:'path',  type: 'varchar', length: 32})
    path: string;
}