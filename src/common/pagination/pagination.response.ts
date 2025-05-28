export class PaginationResponse<T> {
  /*페이지당 항목 수*/
  pageSize: number;

  /*전체 항목 수*/
  totalCount: number;

  /*전체 페이지 수*/
  totalPage: number;

  /*현재 페이지의 항목*/
  items: T[];
  constructor(totalCount: number, pageSize: number, items: T[]) {
    this.pageSize = pageSize;
    this.totalCount = totalCount;

    /*전체 페이지 수 계산*/
    this.totalPage = Math.ceil(totalCount / pageSize);

    /*현재 페이지의 항목들 할당*/
    this.items = items;
  }
}
