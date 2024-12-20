import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn} from 'typeorm';

@Entity('variables')
export class VariablesEntity{
    @PrimaryColumn({name: 'keystr', type: 'varchar', length: 128})
    @ApiProperty({
        example:'',
        description: '키 값'
    })
    key: string;

    @Column({name: 'valuestr', type: 'varchar', length: 128})
    @ApiProperty({
        example:'',
        description: '데이터 값'
    })
    value: string;
}