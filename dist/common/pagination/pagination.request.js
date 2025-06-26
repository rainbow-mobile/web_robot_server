"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationRequest = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PaginationRequest {
    getOffset() {
        if (this.pageNo < 1 || this.pageNo === null || this.pageNo === undefined) {
            this.pageNo = 1;
        }
        if (this.pageSize < 1 ||
            this.pageSize === null ||
            this.pageSize === undefined) {
            this.pageSize = 10;
        }
        return (Number(this.pageNo) - 1) * Number(this.pageSize);
    }
    getLimit() {
        if (this.pageSize < 1 ||
            this.pageSize === null ||
            this.pageSize === undefined) {
            this.pageSize = 10;
        }
        return Number(this.pageSize);
    }
}
exports.PaginationRequest = PaginationRequest;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: '1',
        description: '페이지 번호',
        required: false,
    }),
    __metadata("design:type", Number)
], PaginationRequest.prototype, "pageNo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: '10',
        description: '페이지당 항목 수',
        required: false,
    }),
    __metadata("design:type", Number)
], PaginationRequest.prototype, "pageSize", void 0);
//# sourceMappingURL=pagination.request.js.map