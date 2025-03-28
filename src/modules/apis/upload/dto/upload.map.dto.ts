import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadMapDto {
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '업로드할 맵의 이름 (name 값으로 FRS 상에 맵을 저장)',
    example: 'NewMap',
  })
  name: string;

  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '업로드할 맵의 폴더 이름 (실제 RRS 상에 위치한 맵의 이름)',
    example: 'Map',
  })
  mapNm: string;

  // @IsString()
  // @Length(1, 50)
  // @ApiProperty({
  //   description: '유저 아이디',
  //   example: 'rainbow',
  // })
  // userId: string;

  // @IsString()
  // @Length(1, 255)
  // @ApiProperty({
  //   description: '유저 토큰',
  //   example: '',
  // })
  // token: string;
}
