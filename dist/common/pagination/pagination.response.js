"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationResponse = void 0;
class PaginationResponse {
    constructor(totalCount, pageSize, items) {
        this.pageSize = pageSize;
        this.totalCount = totalCount;
        this.totalPage = Math.ceil(totalCount / pageSize);
        this.items = items;
    }
}
exports.PaginationResponse = PaginationResponse;
