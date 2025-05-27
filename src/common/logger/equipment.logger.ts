import { homedir } from 'os';
import path from 'path';
import * as fs from 'fs';
import { ManipulatorPositionPayload } from '@interface/system/manipulator.interface';
import { TorsoPositionPayload } from '@interface/system/torso.interface';
import {
  AmrDockingPrecisionPayload,
  AmrMovingPrecisionPayload,
  AmrObstaclePayload,
  AmrVelocityPayload,
} from '@interface/system/amr.interface';

function getCustomFilename(suffix: string) {
  const now = new Date();
  const YYYY = now.getFullYear();
  const MM = ('0' + (now.getMonth() + 1)).slice(-2);
  const DD = ('0' + now.getDate()).slice(-2);
  const HH = ('0' + now.getHours()).slice(-2);
  return path.join(
    homedir(),
    'log',
    'socket',
    `${YYYY}${MM}${DD}${HH}_${suffix}.log`,
  );
}

function writeLog(filePath: string, header: string, row: string) {
  const logDir = path.dirname(filePath);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(filePath, header + '\n', { encoding: 'utf8' });
  }
  fs.appendFileSync(filePath, row + '\n', { encoding: 'utf8' });
}

export function generateManipulatorLog(
  data: ManipulatorPositionPayload,
  suffix: string,
) {
  const header =
    'SEM_LOG_VERSION=2.0\nDateTime\tX\tY\tZ\tRX\tRY\tRZ\tBase\tShoulder\tElbow\tWrist1\tWrist2';
  const row = [
    data.dateTime,
    data.x.toFixed(2),
    data.y.toFixed(2),
    data.z.toFixed(2),
    data.rx.toFixed(2),
    data.ry.toFixed(2),
    data.rz.toFixed(2),
    data.base.toFixed(2),
    data.shoulder.toFixed(2),
    data.elbow.toFixed(2),
    data.wrist1.toFixed(2),
    data.wrist2.toFixed(2),
  ].join('\t');
  writeLog(getCustomFilename(suffix), header, row);
}

export function generateTorsoLog(data: TorsoPositionPayload, suffix: string) {
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\tX\tZ\ttheta';
  const row = [
    data.dateTime,
    data.x.toFixed(2),
    data.z.toFixed(2),
    data.theta.toFixed(2),
  ].join('\t');
  writeLog(getCustomFilename(suffix), header, row);
}

export function generateAmrVelocityLog(
  data: AmrVelocityPayload,
  suffix: string,
) {
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\tX\tY\ttheta\tX_vel\tY_vel';
  const row = [
    data.dateTime,
    data.x.toFixed(2),
    data.y.toFixed(2),
    data.theta.toFixed(2),
    data.xVel.toFixed(2),
    data.yVel.toFixed(2),
  ].join('\t');
  writeLog(getCustomFilename(suffix), header, row);
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
    data.distanceFront.toFixed(2),
    data.thetaFront.toFixed(2),
    data.statusBack,
    data.distanceBack.toFixed(2),
    data.thetaBack.toFixed(2),
  ].join('\t');
  writeLog(getCustomFilename(suffix), header, row);
}

export function generateAmrDockingPrecisionLog(
  data: AmrDockingPrecisionPayload,
  suffix: string,
) {
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\t2D_Marker_Recognize_Position';
  const row = [data.dateTime, data.twoDMarkerRecognizePosition].join('\t');
  writeLog(getCustomFilename(suffix), header, row);
}

export function generateAmrMovingPrecisionLog(
  data: AmrMovingPrecisionPayload,
  suffix: string,
) {
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\t2D_Marker_Recognize_Position';
  const row = [data.dateTime, data.twoDMarkerRecognizePosition].join('\t');
  writeLog(getCustomFilename(suffix), header, row);
}
