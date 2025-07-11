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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariablesController = void 0;
const common_1 = require("@nestjs/common");
const variables_service_1 = require("./variables.service");
const swagger_1 = require("@nestjs/swagger");
const variables_dto_1 = require("./dto/variables.dto");
let VariablesController = class VariablesController {
    constructor(variablesService) {
        this.variablesService = variablesService;
        console.log('variables constructor');
    }
    findAll() {
        return this.variablesService.getVariables();
    }
    async findOne(key) {
        return await this.variablesService.getVariable(key);
    }
    async updateVariable(data, res) {
        try {
            const response = await this.variablesService.updateVariable(data.key, data.value);
            res.send(response);
        }
        catch (error) {
            res.status(error.status).send(error.data);
        }
    }
    async insertVariable(data, res) {
        try {
            const response = await this.variablesService.upsertVariable(data.key, data.value);
            res.send(response);
        }
        catch (error) {
            res.status(error.status).send(error.data);
        }
    }
    async deleteVariable(key, res) {
        try {
            const response = await this.variablesService.deleteVariable(key);
            res.send(response);
        }
        catch (error) {
            res.status(error.status).send(error.data);
        }
    }
};
exports.VariablesController = VariablesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Variables DB 조회',
        description: 'DB에 저장된 variables 데이터를 전부 조회합니다',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VariablesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':key'),
    (0, swagger_1.ApiOperation)({
        summary: 'Variables DB 조회(키)',
        description: 'DB에 저장된 variables key값에 해당하는 데이터를 조회합니다',
    }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VariablesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Variables DB 업데이트',
        description: 'Variables DB의 이미 존재하는 값을 업데이트합니다',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [variables_dto_1.VariableDto, Object]),
    __metadata("design:returntype", Promise)
], VariablesController.prototype, "updateVariable", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Variables DB 업데이트',
        description: 'Variables DB에 데이터를 추가하거나 업데이트합니다',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [variables_dto_1.VariableDto, Object]),
    __metadata("design:returntype", Promise)
], VariablesController.prototype, "insertVariable", null);
__decorate([
    (0, common_1.Delete)(':key'),
    (0, swagger_1.ApiOperation)({
        summary: 'Variables 삭제',
        description: 'Variables DB에 key값에 해당하는 데이터를 삭제합니다',
    }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VariablesController.prototype, "deleteVariable", null);
exports.VariablesController = VariablesController = __decorate([
    (0, swagger_1.ApiTags)('DB 관련 API (variables)'),
    (0, common_1.Controller)('variables'),
    __metadata("design:paramtypes", [variables_service_1.VariablesService])
], VariablesController);
