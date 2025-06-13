"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateManipulatorLog = generateManipulatorLog;
exports.generateTorsoLog = generateTorsoLog;
exports.generateAmrVelocityLog = generateAmrVelocityLog;
exports.generateAmrObstacleLog = generateAmrObstacleLog;
exports.generateAmrDockingPrecisionLog = generateAmrDockingPrecisionLog;
exports.generateAmrMovingPrecisionLog = generateAmrMovingPrecisionLog;
exports.setAlarmGeneralLog = setAlarmGeneralLog;
exports.generateGeneralLog = generateGeneralLog;
const os = require("os");
const path = require("path");
const fs = require("fs");
const equipment_enum_1 = require("../enum/equipment.enum");
const socket_logger_1 = require("./socket.logger");
let lastGeneralLog;
function getCustomFilenameWithDate(suffix) {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = ('0' + (now.getMonth() + 1)).slice(-2);
    const DD = ('0' + now.getDate()).slice(-2);
    const HH = ('0' + now.getHours()).slice(-2);
    let baseLogDir;
    baseLogDir = path.join(os.homedir(), 'log', 'samsung-em');
    return path.join(baseLogDir, `${YYYY}${MM}${DD}${HH}_${suffix}.log`);
}
function getCustomFilenameWithoutDate(suffix) {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = ('0' + (now.getMonth() + 1)).slice(-2);
    const DD = ('0' + now.getDate()).slice(-2);
    let baseLogDir;
    baseLogDir = path.join(os.homedir(), 'log', 'samsung-em');
    return path.join(baseLogDir, `${YYYY}${MM}${DD}_${suffix}.log`);
}
function writeLog(filePath, header, row) {
    const logDir = path.dirname(filePath);
    console.log(filePath);
    deleteOldLog(logDir, 30);
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(logDir, { recursive: true });
        fs.appendFileSync(filePath, header + '\n', { encoding: 'utf8' });
    }
    fs.appendFileSync(filePath, row + '\n', { encoding: 'utf8' });
}
function deleteOldLog(baseDir, days = 30) {
    const now = Date.now();
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    if (!fs.existsSync(baseDir))
        return;
    fs.readdirSync(baseDir).forEach((file) => {
        const filePath = path.join(baseDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile() && stats.mtimeMs < cutoff) {
            fs.unlinkSync(filePath);
        }
    });
}
function generateManipulatorLog(data, suffix) {
    const header = 'SEM_LOG_VERSION=2.0\nDateTime\tX\tY\tZ\tRX\tRY\tRZ\tBase\tShoulder\tElbow\tWrist1\tWrist2';
    const row = [
        data.dateTime,
        data.x,
        data.y,
        data.z,
        data.rx,
        data.ry,
        data.rz,
        data.base,
        data.shoulder,
        data.elbow,
        data.wrist1,
        data.wrist2,
    ].join('\t');
    writeLog(getCustomFilenameWithDate(suffix), header, row);
}
function generateTorsoLog(data, suffix) {
    const header = 'SEM_LOG_VERSION=2.0\nDateTime\tX\tZ\ttheta';
    const row = [
        data.dateTime,
        data.x,
        data.z,
        data.theta,
    ].join('\t');
    writeLog(getCustomFilenameWithDate(suffix), header, row);
}
function generateAmrVelocityLog(data, suffix) {
    const header = 'SEM_LOG_VERSION=2.0\nDateTime\tX\tY\ttheta\tX_vel\tY_vel';
    const row = [
        data.dateTime,
        data.x,
        data.y,
        data.theta,
        data.xVel,
        data.yVel,
    ].join('\t');
    writeLog(getCustomFilenameWithDate(suffix), header, row);
}
function generateAmrObstacleLog(data, suffix) {
    const header = 'SEM_LOG_VERSION=2.0\nDateTime\tStatus_Front\tDistance_Front\tTheta_Front\tStatus_Back\tDistance_Back\tTheta_Back';
    const row = [
        data.dateTime,
        data.statusFront,
        data.distanceFront,
        data.thetaFront,
        data.statusBack,
        data.distanceBack,
        data.thetaBack,
    ].join('\t');
    writeLog(getCustomFilenameWithDate(suffix), header, row);
}
function generateAmrDockingPrecisionLog(data, suffix) {
    const header = 'SEM_LOG_VERSION=2.0\nDateTime\t2D_Marker_Recognize_Position';
    const row = [data.dateTime, data.twoDMarkerRecognizePosition].join('\t');
    writeLog(getCustomFilenameWithDate(suffix), header, row);
}
function generateAmrMovingPrecisionLog(data, suffix) {
    const header = 'SEM_LOG_VERSION=2.0\nDateTime\t2D_Marker_Recognize_Position';
    const row = [data.dateTime, data.twoDMarkerRecognizePosition].join('\t');
    writeLog(getCustomFilenameWithDate(suffix), header, row);
}
function setAlarmGeneralLog(alarm, status) {
    const header = 'SEM_LOG_VERSION=2.0\nDateTime\tMachineID\tLogType\tLotID\tRecipe\tProductID\tStatus\tScope\tOperationName\tOperationStatus\tData';
    const row = [
        `${new Date().getFullYear()}-${('0' + (new Date().getMonth() + 1)).slice(-2)}-${('0' + new Date().getDate()).slice(-2)} ${('0' + new Date().getHours()).slice(-2)}:${('0' + new Date().getMinutes()).slice(-2)}:${('0' + new Date().getSeconds()).slice(-2)}.${('00' + new Date().getMilliseconds()).slice(-3)}`,
        global.robotSerial ?? '-',
        equipment_enum_1.GeneralLogType.MANUAL,
        '-',
        '-',
        '-',
        equipment_enum_1.GeneralStatus.ERROR,
        equipment_enum_1.GeneralScope.ALARM,
        alarm.operationName,
        status,
        ''
    ].join('\t');
    writeLog(getCustomFilenameWithoutDate('ROBOT'), header, row);
}
function generateGeneralLog(param) {
    const header = 'SEM_LOG_VERSION=2.0\nDateTime\tMachineID\tLogType\tLotID\tRecipe\tProductID\tStatus\tScope\tOperationName\tOperationStatus\tData';
    if (param.operationStatus === "END") {
        if (!lastGeneralLog || lastGeneralLog.operationStatus !== "START" || lastGeneralLog.operationName !== param.operationName) {
            socket_logger_1.default.warn(`[LOG] generateGeneralLog : unknwon END (${param.operationName}, ${param.operationStatus}) (${lastGeneralLog?.operationName}, ${lastGeneralLog?.operationStatus})`);
            return false;
        }
    }
    const row = [
        param.dateTime ??
            `${new Date().getFullYear()}-${('0' + (new Date().getMonth() + 1)).slice(-2)}-${('0' + new Date().getDate()).slice(-2)} ${('0' + new Date().getHours()).slice(-2)}:${('0' + new Date().getMinutes()).slice(-2)}:${('0' + new Date().getSeconds()).slice(-2)}.${('00' + new Date().getMilliseconds()).slice(-3)}`,
        param.machineId ?? global.robotSerial ?? '-',
        param.logType ?? '-',
        param.lotId ?? '-',
        param.recipe ?? '-',
        param.productId ?? '-',
        param.status ?? '-',
        param.scope ?? '-',
        param.operationName ?? '-',
        param.operationStatus ?? '-',
        typeof param.data === 'undefined' ? '' : param.data,
    ].join('\t');
    lastGeneralLog = param;
    writeLog(getCustomFilenameWithoutDate('ROBOT'), header, row);
    return true;
}
//# sourceMappingURL=equipment.logger.js.map