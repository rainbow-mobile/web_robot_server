import { IsArray, IsOptional, IsString, Length, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {Expose} from 'class-transformer'

export class FrsUrlDto {
    @IsString()
    @Length(1,50)
    @ApiProperty({
        description: 'FRS URL',
        example: 'http://10.108.1.180',
        required:true
    })
    @Expose()
    url: string;
}