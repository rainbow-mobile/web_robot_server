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
exports.StatusTaskEntity = void 0;
const typeorm_1 = require("typeorm");
class StatusTaskEntity {
}
exports.StatusTaskEntity = StatusTaskEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'connection', type: 'boolean' }),
    __metadata("design:type", Boolean)
], StatusTaskEntity.prototype, "connection", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], StatusTaskEntity.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'running', type: 'boolean' }),
    __metadata("design:type", Boolean)
], StatusTaskEntity.prototype, "running", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id', type: 'int' }),
    __metadata("design:type", Number)
], StatusTaskEntity.prototype, "id", void 0);
//# sourceMappingURL=task.entity.js.map