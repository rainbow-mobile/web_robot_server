import { IsArray, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TaskSaveDto {
  @IsArray()
  @ApiProperty({
    description: 'Task 트리',
    example: [
      {
        key: '0',
        label: 'root',
        children: [
          {
            label: 'begin',
            children: [],
          },
          {
            label: 'end',
            children: [],
          },
        ],
      },
    ],
  })
  data: [] = [];
}
