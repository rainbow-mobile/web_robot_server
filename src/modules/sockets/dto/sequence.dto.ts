import { GeneralOperationStatus, ManipulatoreOperationName } from "@common/enum/equipment.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString, Length } from "class-validator";

export class SequenceDto{
    @IsString()
    @Length(1,5)
    @ApiProperty({
        description: '시퀀스 이름',
        example: 'READY',
        enum: ManipulatoreOperationName,
        required:true
    })
    operationName: string;

    @IsString()
    @Length(1,5)
    @ApiProperty({
        description: '시퀀스 현 상태 (START, END, SET) 중 하나의 값일 것',
        example: GeneralOperationStatus.START,
        enum: GeneralOperationStatus,
        required:false
    })
    operationStatus: string;
}