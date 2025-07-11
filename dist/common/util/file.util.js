"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJson = readJson;
exports.deleteFile = deleteFile;
exports.saveJson = saveJson;
exports.readCsv = readCsv;
exports.saveCsv = saveCsv;
const fs = require("fs");
const common_1 = require("@nestjs/common");
const http_logger_1 = require("../logger/http.logger");
const csv = require("csv");
const http_status_messages_constants_1 = require("../constants/http-status-messages.constants");
const error_util_1 = require("./error.util");
async function readJson(dir) {
    return new Promise(async (resolve, reject) => {
        try {
            fs.open(dir, 'r', (err, fd) => {
                if (err) {
                    http_logger_1.default.error(`[FILE] readJson: ${dir}, ${(0, error_util_1.errorToJson)(err)}`);
                    reject({
                        status: common_1.HttpStatus.NOT_FOUND,
                        data: { message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.NOT_FOUND_404 },
                    });
                }
                else {
                    const filecontent = fs.readFileSync(dir, 'utf-8');
                    const jsonData = JSON.parse(filecontent);
                    resolve(jsonData);
                }
            });
        }
        catch (error) {
            http_logger_1.default.error(`[FILE] readJson: ${dir}, ${(0, error_util_1.errorToJson)(error)}`);
            reject({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                data: { message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.FAIL_READ_500 },
            });
        }
    });
}
async function deleteFile(dir) {
    return new Promise(async (resolve, reject) => {
        try {
            fs.open(dir, 'r', (err, fd) => {
                if (err) {
                    http_logger_1.default.error(`[FILE] deleteFile: ${dir}, ${(0, error_util_1.errorToJson)(err)}`);
                    reject({
                        status: common_1.HttpStatus.NOT_FOUND,
                        data: { message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.NOT_FOUND_404 },
                    });
                }
                else {
                    fs.unlink(dir, (err) => {
                        if (err) {
                            http_logger_1.default.error(`[FILE] deleteFile: ${dir}, ${(0, error_util_1.errorToJson)(err)}`);
                            reject({
                                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                                data: {
                                    message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.FAIL_DELETE_500,
                                },
                            });
                        }
                        resolve({
                            message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.SUCCESS_DELETE_200,
                        });
                    });
                }
            });
        }
        catch (error) {
            http_logger_1.default.error(`[FILE] deleteFile: ${dir}, ${(0, error_util_1.errorToJson)(error)}`);
            reject({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                data: { message: error },
            });
        }
    });
}
async function saveJson(dir, data) {
    return new Promise(async (resolve, reject) => {
        try {
            fs.writeFileSync(dir, JSON.stringify(data, null, 2));
            http_logger_1.default.info(`[FILE] saveJson: ${dir}, ${JSON.stringify(data)}`);
            resolve({
                message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.SUCCESS_WRITE_201,
                data: data,
            });
        }
        catch (error) {
            http_logger_1.default.error(`[FILE] saveJson: ${dir}, ${(0, error_util_1.errorToJson)(error)}`);
            reject({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                data: { message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.FAIL_WRITE_500 },
            });
        }
    });
}
async function readCsv(dir) {
    return new Promise(async (resolve, reject) => {
        try {
            fs.open(dir, 'r', (err, fd) => {
                if (err) {
                    http_logger_1.default.error(`[FILE] readCSV: ${dir}, ${(0, error_util_1.errorToJson)(err)}`);
                    reject({
                        status: common_1.HttpStatus.NOT_FOUND,
                        data: { message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.NOT_FOUND_404 },
                    });
                }
                else {
                    const results = [];
                    fs.createReadStream(dir)
                        .pipe(csv.parse({
                        skip_empty_lines: true,
                        skip_records_with_error: true,
                    }))
                        .on('data', (data) => {
                        results.push(data);
                    })
                        .on('error', (error) => {
                        http_logger_1.default.error(`[FILE] readCSV: ${dir}, ${(0, error_util_1.errorToJson)(error)}`);
                        reject({
                            status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                            data: {
                                message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.FAIL_READ_500,
                            },
                        });
                    })
                        .on('end', () => {
                        http_logger_1.default.debug(`[FILE] readCSV: ${dir}`);
                        resolve(results);
                    });
                }
            });
        }
        catch (error) {
            http_logger_1.default.error(`[FILE] readCSV: ${dir}, ${(0, error_util_1.errorToJson)(error)}`);
            reject({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                data: { message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.FAIL_READ_500 },
            });
        }
    });
}
async function saveCsv(dir, data) {
    return new Promise(async (resolve, reject) => {
        try {
            const csvData = data.map((row) => row.join(',')).join('\n');
            fs.writeFile(dir, csvData, (err) => {
                if (err) {
                    http_logger_1.default.error(`[FILE] saveCSV: ${dir}, ${(0, error_util_1.errorToJson)(err)}`);
                    reject({
                        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.FAIL_WRITE_500,
                    });
                }
                http_logger_1.default.debug(`[FILE] saveCsv: ${dir}, ${(0, error_util_1.errorToJson)(data)}`);
                resolve({
                    message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.SUCCESS_WRITE_201,
                });
            });
        }
        catch (error) {
            http_logger_1.default.error(`[FILE] saveCsv: ${dir}, ${(0, error_util_1.errorToJson)(error)}`);
            reject({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                data: { message: http_status_messages_constants_1.HttpStatusMessagesConstants.FILE.FAIL_WRITE_500 },
            });
        }
    });
}
