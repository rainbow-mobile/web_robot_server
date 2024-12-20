import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsArray, IsOptional, IsString, Length } from "class-validator";

export class NetworkWifiDto{
    @IsString()
    @Length(1,50)
    @ApiProperty({
        description:"네트워크 이름",
        example:'',
        required:true
    })
    @Expose()
    ssid: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description:"네트워크 비밀번호",
        example:''
    })
    @Expose()
    password: string;

}