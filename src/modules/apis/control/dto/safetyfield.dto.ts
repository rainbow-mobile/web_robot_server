import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class SetSafetyFieldDto {
    @IsNumber()
    @ApiProperty({
        description:'',
        example: 0
    })
    field: number;
}