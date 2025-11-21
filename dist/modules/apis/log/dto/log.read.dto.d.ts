import { PaginationRequest } from '@common/pagination/pagination.request';
export declare class LogReadDto extends PaginationRequest {
    startDt?: string;
    endDt?: string;
    levels?: string[];
    category?: string;
    searchType?: string;
    searchText?: string;
    sortOption?: string;
}
