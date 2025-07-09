export declare class PaginationRequest {
    pageNo?: number | 1;
    pageSize?: number | 10;
    getOffset(): number;
    getLimit(): number;
}
