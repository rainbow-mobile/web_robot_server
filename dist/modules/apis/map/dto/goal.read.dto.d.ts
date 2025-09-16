import { PaginationRequest } from '@common/pagination/pagination.request';
export declare class GoalReadDto extends PaginationRequest {
    type?: string;
    searchText?: string;
    sortOption?: string;
}
