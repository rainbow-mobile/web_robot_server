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
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const http_logger_1 = require("../../../common/logger/http.logger");
const fs = require("fs");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const error_util_1 = require("../../../common/util/error.util");
let TaskService = class TaskService {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    async getTaskList(path) {
        try {
            http_logger_1.default.info(`[TASK] getTaskList : ${path}`);
            const files = await fs.promises.readdir(path, { withFileTypes: true });
            let list = [];
            files.map((file) => {
                if (file.name.split('.').length > 1) {
                    if (file.name.split('.')[1] == 'task') {
                        list.push(file.name);
                    }
                }
            });
            return list;
        }
        catch (e) {
            http_logger_1.default.error(`[TASK] getTaskList: ${(0, error_util_1.errorToJson)(e)}`);
        }
    }
    async getTaskInfo() {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.taskman != null) {
                this.socketGateway.server.to('taskman').emit("file");
                this.socketGateway.taskman.once("taskInit", (data) => {
                    this.socketGateway.taskState.file = data.file;
                    this.socketGateway.taskState.id = data.id;
                    this.socketGateway.taskState.running = data.running;
                    resolve(this.socketGateway.taskState);
                    clearTimeout(timeoutId);
                });
                const timeoutId = setTimeout(() => {
                    http_logger_1.default.warn(`[TASK] getTaskInfo: Timeout`);
                    reject({ status: common_1.HttpStatus.GATEWAY_TIMEOUT, data: { message: "프로그램이 응답하지 않습니다" } });
                }, 5000);
            }
            else {
                http_logger_1.default.warn(`[TASK] getTaskInfo: Disconnect`);
                reject({ status: common_1.HttpStatus.GATEWAY_TIMEOUT, data: { message: "프로그램이 연결되지 않았습니다" } });
            }
        });
    }
    async loadTask(path) {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.taskman != null) {
                http_logger_1.default.info(`[TASK] loadTask: ${path}`);
                this.socketGateway.server.to('taskman').emit("taskLoad", path);
                this.socketGateway.taskman.once("taskLoad", (data) => {
                    http_logger_1.default.info(`[TASK] loadTask Response: ${JSON.stringify(data)}`);
                    if (data.result == "success") {
                        this.socketGateway.taskState.file = data.file;
                        resolve(data);
                    }
                    else {
                        reject({ status: common_1.HttpStatus.NOT_FOUND, data: { message: "로드에 실패하였습니다", data: data } });
                    }
                    clearTimeout(timeoutId);
                });
                const timeoutId = setTimeout(() => {
                    http_logger_1.default.warn(`[TASK] loadTask: Timeout`);
                    reject({ status: common_1.HttpStatus.GATEWAY_TIMEOUT, data: { message: "프로그램이 응답하지 않습니다" } });
                }, 5000);
            }
            else {
                http_logger_1.default.warn(`[TASK] loadTask: Disconnect`);
                reject({ status: common_1.HttpStatus.GATEWAY_TIMEOUT, data: { message: "프로그램이 연결되지 않았습니다" } });
            }
        });
    }
    async runTask() {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.taskman != null) {
                http_logger_1.default.info(`[TASK] runTask`);
                this.socketGateway.server.to('taskman').emit("taskRun");
                this.socketGateway.taskman.once("taskRun", (data) => {
                    http_logger_1.default.info(`[TASK] runTask Response: ${JSON.stringify(data)}`);
                    resolve(data);
                    clearTimeout(timeoutId);
                });
                const timeoutId = setTimeout(() => {
                    http_logger_1.default.warn(`[TASK] runTask Response: Timeout`);
                    reject({ status: common_1.HttpStatus.GATEWAY_TIMEOUT, data: { message: "프로그램이 응답하지 않습니다" } });
                }, 5000);
            }
            else {
                http_logger_1.default.warn(`[TASK] runTask Response: Disconnect`);
                reject({ status: common_1.HttpStatus.GATEWAY_TIMEOUT, data: { message: "프로그램이 연결되지 않았습니다" } });
            }
        });
    }
    async stopTask() {
        return new Promise((resolve, reject) => {
            if (this.socketGateway.taskman != null) {
                http_logger_1.default.info(`[TASK] stopTask`);
                this.socketGateway.server.to('taskman').emit("taskStop");
                this.socketGateway.taskman.once("taskStop", (data) => {
                    http_logger_1.default.info(`[TASK] stopTask Response: ${JSON.stringify(data)}`);
                    resolve(data);
                    clearTimeout(timeoutId);
                });
                const timeoutId = setTimeout(() => {
                    http_logger_1.default.error(`[TASK] stopTask Response: Timeout`);
                    reject({ status: common_1.HttpStatus.GATEWAY_TIMEOUT, data: { message: "프로그램이 응답하지 않습니다" } });
                }, 5000);
            }
            else {
                http_logger_1.default.error(`[TASK] stopTask Response: Disconnect`);
                reject({ status: common_1.HttpStatus.GATEWAY_TIMEOUT, data: { message: "프로그램이 연결되지 않았습니다" } });
            }
        });
    }
    async findKeyword(line) {
        const keyword = [
            "repeat",
            "begin",
            "wait",
            "script",
            "socket_func",
            "halt",
            "end",
            "general_thread",
            "map",
            "else if",
            "if",
            "else",
            "move",
            "break",
            "continue",
            "folder",
            "assign",
            "subp",
            "undock",
            "dock",
        ];
        const result = [];
        for (const key of keyword) {
            if (line.includes(key)) {
                result.push(key);
            }
        }
        return result[0];
    }
    ;
    findValue(line) {
        return line.split("(")[1].split(")")[0];
    }
    ;
    findValueSub(keyword, line) {
        return line.split(keyword)[1].replace(" ", "");
    }
    ;
    findSocketChildren(line) {
        return line.split("{")[1].split("}")[0];
    }
    ;
    async textToTreeData(text) {
        const lines = text
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line !== "");
        const stack = [];
        const root = { key: "0", label: "root", children: [] };
        var start_script = false;
        var start_folder = false;
        var start_assign = false;
        var script_value = "";
        stack.push(root);
        try {
            lines.map(async (line) => {
                const keyword = await this.findKeyword(line);
                const new_tree = line.includes("{");
                const end_tree = line.includes("}") && !line.includes("{");
                if (keyword == "begin") {
                    const new_node = { label: "begin", children: [] };
                    stack[stack.length - 1].children.push(new_node);
                }
                else if (keyword == "wait") {
                    const value = this.findValue(line);
                    const new_node = { label: "wait", data: value, children: [] };
                    stack[stack.length - 1].children.push(new_node);
                }
                else if (keyword == "script") {
                    start_script = true;
                }
                else if (keyword == "subp") {
                    const value = this.findValueSub(keyword, line);
                    const new_node = { label: "subp", data: value, children: [] };
                    stack[stack.length - 1].children.push(new_node);
                }
                else if (keyword == "assign") {
                    start_assign = true;
                }
                else if (keyword == "folder") {
                    const value = this.findValue(line);
                    const new_node = { label: "folder", data: value, children: [] };
                    stack[stack.length - 1].children.push(new_node);
                    stack.push(new_node);
                    start_folder = true;
                }
                else if (keyword == "socket_func") {
                    const value = this.findValue(line);
                    const socket_child = this.findSocketChildren(line);
                    const new_node = {
                        label: "socket_func_" + value,
                        data: socket_child,
                        children: [],
                    };
                    stack[stack.length - 1].children.push(new_node);
                }
                else if (keyword == "repeat") {
                    const value = this.findValue(line);
                    const new_node = { label: "repeat", data: value, children: [] };
                    stack[stack.length - 1].children.push(new_node);
                    stack.push(new_node);
                }
                else if (keyword == "end") {
                    const new_node = { label: "end", children: [] };
                    stack[stack.length - 1].children.push(new_node);
                }
                else if (keyword == "move") {
                    const value = this.findValue(line);
                    const new_node = {
                        icon: "pi pi-fw pi-forward",
                        label: "move",
                        data: value,
                        children: [],
                    };
                    stack[stack.length - 1].children.push(new_node);
                }
                else if (keyword == "halt") {
                    const new_node = { label: "halt", children: [] };
                    stack[stack.length - 1].children.push(new_node);
                }
                else if (keyword == "if") {
                    const value = this.findValue(line);
                    const new_node = { label: "if", data: value, children: [] };
                    stack[stack.length - 1].children.push(new_node);
                    stack.push(new_node);
                }
                else if (keyword == "else if") {
                    const value = this.findValue(line);
                    const new_node = { label: "else if", data: value, children: [] };
                    stack[stack.length - 1].children.push(new_node);
                    stack.push(new_node);
                }
                else if (keyword == "else") {
                    const new_node = { label: "else", children: [] };
                    stack[stack.length - 1].children.push(new_node);
                    stack.push(new_node);
                }
                else if (keyword == "break") {
                    const new_node = { label: "break", children: [] };
                    stack[stack.length - 1].children.push(new_node);
                }
                else if (keyword == "continue") {
                    const new_node = { label: "continue", children: [] };
                    stack[stack.length - 1].children.push(new_node);
                }
                else if (keyword == "general_thread") {
                    const new_node = { label: "general_thread", children: [] };
                    stack[stack.length - 1].children.push(new_node);
                    stack.push(new_node);
                }
                else if (keyword == "map") {
                    const new_node = { label: "map", children: [] };
                    stack[stack.length - 1].children.push(new_node);
                }
                else if (keyword == "dock") {
                    const new_node = { label: "dock", children: [] };
                    stack[stack.length - 1].children.push(new_node);
                }
                else if (keyword == "undock") {
                    const new_node = { label: "undock", children: [] };
                    stack[stack.length - 1].children.push(new_node);
                }
                else {
                    if (start_script) {
                        if (end_tree) {
                            const new_node = {
                                label: "script",
                                data: script_value.trimEnd(),
                                children: [],
                            };
                            stack[stack.length - 1].children.push(new_node);
                            start_script = false;
                            script_value = "";
                        }
                        else {
                            line.trim();
                            script_value += line + "\n";
                        }
                    }
                    else if (start_assign) {
                        if (end_tree) {
                            const new_node = {
                                label: "assign",
                                data: script_value.trimEnd(),
                                children: [],
                            };
                            stack[stack.length - 1].children.push(new_node);
                            start_assign = false;
                            script_value = "";
                        }
                        else {
                            line.trim();
                            script_value += line + "\n";
                        }
                    }
                    else if (end_tree) {
                        stack.pop();
                    }
                }
            });
        }
        catch (error) {
            http_logger_1.default.error(`[TASK] textToTreeData: ${(0, error_util_1.errorToJson)(error)}`);
        }
        return [root];
    }
    ;
    async parse(dir) {
        return new Promise(async (resolve, reject) => {
            http_logger_1.default.info(`[TASK] parse : ${dir}`);
            fs.open(dir, "r", async (err, fd) => {
                if (err) {
                    http_logger_1.default.error(`[TASK] parse: ${(0, error_util_1.errorToJson)(err)}`);
                    reject();
                }
                else {
                    const file = fs.readFileSync(dir, "utf-8");
                    const result = await this.textToTreeData(file);
                    resolve(result);
                }
            });
        });
    }
    async save(dir, data) {
        return new Promise(async (resolve, reject) => {
            const text = await this.treeToText(data);
            fs.writeFile(dir, text, (err) => {
                if (err) {
                    http_logger_1.default.error(`[TASK] save: ${dir}, ${(0, error_util_1.errorToJson)(err)}`);
                    reject(err);
                }
                http_logger_1.default.info("[TASK] save: " + dir);
                resolve(text);
            });
        });
    }
    async treeToText(tree) {
        let text = "";
        const traverse = (node, indentLevel) => {
            let indent = "";
            if (indentLevel == 0) {
            }
            else {
                indent = " ".repeat((indentLevel - 1) * 4);
            }
            switch (node.label) {
                case "begin":
                    text += `${indent}begin\n`;
                    break;
                case "wait":
                    text += `${indent}wait (${node.data})\n`;
                    break;
                case "repeat":
                    text += `${indent}repeat (${node.data}){\n`;
                    break;
                case "folder":
                    text += `${indent}folder (${node.data}){\n`;
                    break;
                case "halt":
                    text += `${indent}halt\n`;
                    break;
                case "general_thread":
                    text += `${indent}general_thread{\n`;
                    break;
                case "end":
                    text += `${indent}end\n`;
                    break;
                case "move":
                    text += `${indent}move (${node.data})\n`;
                    break;
                case "subp":
                    text += `${indent}subp ${node.data}\n`;
                    break;
                case "if":
                    text += `${indent}if (${node.data}){\n`;
                    break;
                case "else if":
                    text += `${indent}else if (${node.data}){\n`;
                    break;
                case "else":
                    text += `${indent}else{\n`;
                    break;
                case "break":
                    text += `${indent}break\n`;
                    break;
                case "continue":
                    text += `${indent}continue\n`;
                    break;
                case "map":
                    text += `${indent}map\n`;
                    break;
                case "dock":
                    text += `${indent}dock()\n`;
                    break;
                case "undock":
                    text += `${indent}undock()\n`;
                    break;
                case "script": {
                    const lines = node.data.split("\n");
                    const childindent = " ".repeat(indentLevel * 4);
                    text += `${indent}script{\n`;
                    lines.forEach((line) => {
                        text += `${childindent}${line}\n`;
                    });
                    text += `${indent}}\n`;
                    break;
                }
                case "assign": {
                    const lines = node.data.split("\n");
                    const childindent = " ".repeat(indentLevel * 4);
                    text += `${indent}assign{\n`;
                    lines.forEach((line) => {
                        text += `${childindent}${line}\n`;
                    });
                    text += `${indent}}\n`;
                    break;
                }
            }
            if (node.label.includes("socket_func")) {
                const id = node.label.split("_")[2];
                text += `${indent}socket_func(${id}){${node.data}}\n`;
            }
            if (node.children && node.children.length > 0) {
                node.children.forEach((child) => traverse(child, indentLevel + 1));
                if (node.label != "root")
                    text += `${indent}}\n`;
            }
        };
        tree.forEach((rootNode) => traverse(rootNode, 0));
        return text.trim();
    }
    ;
    async list(dir) {
        try {
            const files = await fs.promises.readdir(dir, { withFileTypes: true });
            let list = [];
            files.map((file) => {
                if (file.name.split(".").length > 1) {
                    if (file.name.split(".")[1] == "task") {
                        list.push(file.name);
                    }
                }
            });
            return list;
        }
        catch (e) {
            http_logger_1.default.error(`[TASK] list: ${dir}, ${(0, error_util_1.errorToJson)(e)}`);
        }
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], TaskService);
//# sourceMappingURL=task.service.js.map