import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString, Length } from "class-validator";

export class AlarmDto{
    @IsString()
    @Length(1,5)
    @ApiProperty({
        description: 'alarmCode',
        example: '2000',
        required:true
    })
    alarmCode: string;

    @IsString()
    @ApiProperty({
        description: 'alarmDetail',
        example: '',
        required:false
    })
    alarmDetail?: string;
    
    @IsBoolean()
    @ApiProperty({
        description: 'state',
        example: true
    })
    state: boolean;
}