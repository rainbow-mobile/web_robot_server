import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class NetworkDto {
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '네트워크 이름',
    example: '',
    required: true,
  })
  @Expose()
  name: string;

  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '네트워크 디바이스 이름',
    example: 'eno1',
    required: true,
  })
  @Expose()
  device: string;

  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '네트워크 아이피',
    example: '',
    required: true,
  })
  @Expose()
  ip: string;
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '네트워크 게이트웨이',
    example: '',
    required: true,
  })
  @Expose()
  gateway: string;

  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '네트워크 서브넷',
    example: '',
    required: true,
  })
  @Expose()
  mask: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: '네트워크 DNS',
    example: '',
  })
  @Expose()
  dns: string[];
}
