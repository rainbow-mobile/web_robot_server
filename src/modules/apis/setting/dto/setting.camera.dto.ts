import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsNotEmpty } from 'class-validator';

export class CameraOrderChangeDto {
  @IsObject()
  @IsNotEmpty()
  @ApiProperty({
    description: '카메라 순서',
    example: {
      cam1: 'serial_number',
      cam2: 'serial_number',
    },
  })
  orderInfo: { [key: string]: string };
}
