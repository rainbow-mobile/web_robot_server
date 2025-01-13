import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationRequest {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '1',
    description: '페이지 번호',
    required: false,
  })
  pageNo?: number | 1;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '10',
    description: '페이지당 항목 수',
    required: false,
  })
  pageSize?: number | 10;

  /*해당 페이지의 처음 항목의 오프셋을 계산하는 함수*/
  getOffset(): number {
    if (this.pageNo < 1 || this.pageNo === null || this.pageNo === undefined) {
      this.pageNo = 1;
    }

    if (
      this.pageSize < 1 ||
      this.pageSize === null ||
      this.pageSize === undefined
    ) {
      this.pageSize = 10;
    }

    return (Number(this.pageNo) - 1) * Number(this.pageSize);
  }

  /*한 페이지의 최대 항목 수를 계산하는 함수*/
  getLimit(): number {
    if (
      this.pageSize < 1 ||
      this.pageSize === null ||
      this.pageSize === undefined
    ) {
      this.pageSize = 10;
    }
    return Number(this.pageSize);
  }
}
