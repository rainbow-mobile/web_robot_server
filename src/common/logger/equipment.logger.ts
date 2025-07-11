import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import {
  AmrDockingPrecisionPayload,
  AmrMovingPrecisionPayload,
  AmrObstaclePayload,
  AmrVelocityPayload,
  ManipulatorPositionPayload,
  TorsoPositionPayload,
} from '@interface/system/equipment.interface';
import {
  GeneralLogType,
  GeneralOperationName,
  GeneralOperationStatus,
  GeneralScope,
  GeneralStatus,
} from '@common/enum/equipment.enum';
import { AlarmDto } from '@sockets/dto/alarm.dto';
import { AlarmEntity } from 'src/modules/apis/log/entity/alarm.entity';
import socketLogger from './socket.logger';

let lastGeneralLog;

function getCustomFilenameWithDate(suffix: string) {
  const now = new Date();
  const YYYY = now.getFullYear();
  const MM = ('0' + (now.getMonth() + 1)).slice(-2);
  const DD = ('0' + now.getDate()).slice(-2);
  const HH = ('0' + now.getHours()).slice(-2);

  const baseLogDir: string = path.join('/data', 'log', 'samsung-em');
  // }

  return path.join(baseLogDir, `${YYYY}${MM}${DD}${HH}_${suffix}.log`);
}

function getCustomFilenameWithoutDate(suffix: string) {
  const now = new Date();
  const YYYY = now.getFullYear();
  const MM = ('0' + (now.getMonth() + 1)).slice(-2);
  const DD = ('0' + now.getDate()).slice(-2);

  const baseLogDir: string = path.join('/data', 'log', 'samsung-em');
  // }

  return path.join(baseLogDir, `${YYYY}${MM}${DD}_${suffix}.log`);
}

function writeLog(filePath: string, header: string, row: string) {
  const logDir = path.dirname(filePath);

  // console.log(filePath);
  deleteOldLog(logDir, 30);

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(filePath, header + '\n', { encoding: 'utf8' });
  }
  fs.appendFileSync(filePath, row + '\n', { encoding: 'utf8' });
}

function deleteOldLog(baseDir: string, days: number = 30) {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  if (!fs.existsSync(baseDir)) return;

  fs.readdirSync(baseDir).forEach((file) => {
    const filePath = path.join(baseDir, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && stats.mtimeMs < cutoff) {
      fs.unlinkSync(filePath);
    }
  });
}

export function generateManipulatorLog(
  data: ManipulatorPositionPayload,
  suffix: string,
) {
  const header =
    'SEM_LOG_VERSION=2.0\nDateTime\tX\tY\tZ\tRX\tRY\tRZ\tBase\tShoulder\tElbow\tWrist1\tWrist2';

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

export function generateTorsoLog(data: TorsoPositionPayload, suffix: string) {
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\tX\tZ\ttheta';
  const row = [data.dateTime, data.x, data.z, data.theta].join('\t');
  writeLog(getCustomFilenameWithDate(suffix), header, row);
}

export function generateAmrVelocityLog(
  data: AmrVelocityPayload,
  suffix: string,
) {
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\tX\tY\ttheta\tX_vel\tY_vel';
  const row = [
    data.dateTime,
    // data.x.toFixed(2),
    // data.y.toFixed(2),
    // data.theta.toFixed(2),
    // data.xVel.toFixed(2),
    // data.yVel.toFixed(2),
    data.x,
    data.y,
    data.theta,
    data.xVel,
    data.yVel,
  ].join('\t');
  writeLog(getCustomFilenameWithDate(suffix), header, row);
}

export function generateAmrObstacleLog(
  data: AmrObstaclePayload,
  suffix: string,
) {
  const header =
    'SEM_LOG_VERSION=2.0\nDateTime\tStatus_Front\tDistance_Front\tTheta_Front\tStatus_Back\tDistance_Back\tTheta_Back';
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

export function generateAmrDockingPrecisionLog(
  data: AmrDockingPrecisionPayload,
  suffix: string,
) {
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\t2D_Marker_Recognize_Position';
  const row = [data.dateTime, data.twoDMarkerRecognizePosition].join('\t');
  writeLog(getCustomFilenameWithDate(suffix), header, row);
}

export function generateAmrMovingPrecisionLog(
  data: AmrMovingPrecisionPayload,
  suffix: string,
) {
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\t2D_Marker_Recognize_Position';
  const row = [data.dateTime, data.twoDMarkerRecognizePosition].join('\t');
  writeLog(getCustomFilenameWithDate(suffix), header, row);
}

export function setAlarmGeneralLog(
  alarm: AlarmEntity,
  status: GeneralOperationStatus,
) {
  const header =
    'SEM_LOG_VERSION=2.0\nDateTime\tMachineID\tLogType\tLotID\tRecipe\tProductID\tStatus\tScope\tOperationName\tOperationStatus\tData';
  const row = [
    `${new Date().getFullYear()}-${('0' + (new Date().getMonth() + 1)).slice(-2)}-${('0' + new Date().getDate()).slice(-2)} ${('0' + new Date().getHours()).slice(-2)}:${('0' + new Date().getMinutes()).slice(-2)}:${('0' + new Date().getSeconds()).slice(-2)}.${('00' + new Date().getMilliseconds()).slice(-3)}`,
    global.robotSerial ?? '-',
    GeneralLogType.MANUAL,
    '-',
    '-',
    '-',
    GeneralStatus.ERROR,
    GeneralScope.ALARM,
    alarm.operationName,
    status,
    '',
  ].join('\t');

  writeLog(getCustomFilenameWithoutDate('ROBOT'), header, row);
}

export function generateGeneralLog(param: {
  dateTime?: string;
  machineId?: string;
  logType: GeneralLogType;
  lotId?: string;
  recipe?: string;
  productId?: string;
  status: GeneralStatus;
  scope: string;
  operationName: string;
  operationStatus: GeneralOperationStatus;
  data?: string;
}) {
  const header =
    'SEM_LOG_VERSION=2.0\nDateTime\tMachineID\tLogType\tLotID\tRecipe\tProductID\tStatus\tScope\tOperationName\tOperationStatus\tData';

  if (param.operationStatus === GeneralOperationStatus.END) {
    if (
      !lastGeneralLog ||
      lastGeneralLog.operationStatus !== GeneralOperationStatus.START ||
      lastGeneralLog.operationName !== param.operationName
    ) {
      socketLogger.warn(
        `[LOG] generateGeneralLog : unknown END (${param.operationName}, ${param.operationStatus}) (${lastGeneralLog?.operationName}, ${lastGeneralLog?.operationStatus})`,
      );
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

  socketLogger.debug(`[LOG] generalLog : ${row}`);
  lastGeneralLog = param;
  writeLog(getCustomFilenameWithoutDate('ROBOT'), header, row);
  return true;
}
