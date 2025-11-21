export declare class PaginationResponse<T> {
    pageSize: number;
    totalCount: number;
    totalPage: number;
    items: T[];
    constructor(totalCount: number, pageSize: number, items: T[]);
}
