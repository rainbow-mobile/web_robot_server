import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReqUpdateSoftwareDto {
  @ApiProperty({
    description: '업데이트할 소프트웨어 종류 (예: rrs, slamnav2)',
    example: 'slamnav2',
    default: 'slamnav2',
  })
  @IsString()
  @IsNotEmpty()
  software: string;

  @ApiProperty({
    description: '업데이트할 브랜치 이름',
    example: 'main',
    default: 'main',
  })
  @IsString()
  @IsNotEmpty()
  branch: string;
}
