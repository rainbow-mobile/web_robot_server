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
exports.MoveStatusStateEntity = void 0;
const typeorm_1 = require("typeorm");
class MoveStatusStateEntity {
}
exports.MoveStatusStateEntity = MoveStatusStateEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'state', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], MoveStatusStateEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auto_move', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], MoveStatusStateEntity.prototype, "auto_move", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dock_move', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], MoveStatusStateEntity.prototype, "dock_move", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'jog_move', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], MoveStatusStateEntity.prototype, "jog_move", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'obs', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], MoveStatusStateEntity.prototype, "obs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'path', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], MoveStatusStateEntity.prototype, "path", void 0);
