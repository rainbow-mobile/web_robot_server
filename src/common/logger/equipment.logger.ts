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

export function generateManipulatorLog(
  data: ManipulatorPositionPayload,
  suffix: string,
) {
  const filePath = getCustomFilename(suffix);
  const logDir = path.dirname(filePath);
  const header =
    'SEM_LOG_VERSION=2.0\nDateTime\tX\tY\tZ\tRX\tRY\tRZ\tBase\tShoulder\tElbow\tWrist1\tWrist2\tWrist3';

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(filePath, header + '\n', { encoding: 'utf8' });
  }

  const row = `${data.dateTime}\t${data.x.toFixed(2)}\t${data.y.toFixed(2)}\t${data.z.toFixed(2)}\t${data.rx.toFixed(2)}\t${data.ry.toFixed(2)}\t${data.rz.toFixed(2)}\t${data.base.toFixed(2)}\t${data.shoulder.toFixed(2)}\t${data.elbow.toFixed(2)}\t${data.wrist1.toFixed(2)}\t${data.wrist2.toFixed(2)}`;

  fs.appendFileSync(filePath, row + '\n', { encoding: 'utf8' });
}

export function generateTorsoLog(data: TorsoPositionPayload, suffix: string) {
  const filePath = getCustomFilename(suffix);
  const logDir = path.dirname(filePath);
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\tX\tZ\ttheta';

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(filePath, header + '\n', { encoding: 'utf8' });
  }

  const row = `${data.dateTime}\t${data.x.toFixed(2)}\t${data.z.toFixed(2)}\t${data.theta.toFixed(2)}`;

  fs.appendFileSync(filePath, row + '\n', { encoding: 'utf8' });
}

export function generateAmrVelocityLog(
  data: AmrVelocityPayload,
  suffix: string,
) {
  const filePath = getCustomFilename(suffix);
  const logDir = path.dirname(filePath);
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\tX\tY\ttheta\tX_vel\tY_vel';

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(filePath, header + '\n', { encoding: 'utf8' });
  }

  const row = `${data.dateTime}\t${data.x.toFixed(2)}\t${data.y.toFixed(2)}\t${data.theta.toFixed(2)}\t${data.xVel.toFixed(2)}\t${data.yVel.toFixed(2)}`;

  fs.appendFileSync(filePath, row + '\n', { encoding: 'utf8' });
}

export function generateAmrObstacleLog(
  data: AmrObstaclePayload,
  suffix: string,
) {
  const filePath = getCustomFilename(suffix);
  const logDir = path.dirname(filePath);
  const header =
    'SEM_LOG_VERSION=2.0\nDateTime\tStatus_Front\tDistance_Front\tTheta_Front\tStatus_Back\tDistance_Back\tTheta_Back';

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(filePath, header + '\n', { encoding: 'utf8' });
  }

  const row = `${data.dateTime}\t${data.statusFront}\t${data.distanceFront.toFixed(2)}\t${data.thetaFront.toFixed(2)}\t${data.statusBack}\t${data.distanceBack.toFixed(2)}\t${data.thetaBack.toFixed(2)}`;

  fs.appendFileSync(filePath, row + '\n', { encoding: 'utf8' });
}

export function generateAmrDockingPrecisionLog(
  data: AmrDockingPrecisionPayload,
  suffix: string,
) {
  const filePath = getCustomFilename(suffix);
  const logDir = path.dirname(filePath);
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\t2D_Marker_Recognize_Position';

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(filePath, header + '\n', { encoding: 'utf8' });
  }

  const row = `${data.dateTime}\t${data.twoDMarkerRecognizePosition}`;

  fs.appendFileSync(filePath, row + '\n', { encoding: 'utf8' });
}

export function generateAmrMovingPrecisionLog(
  data: AmrMovingPrecisionPayload,
  suffix: string,
) {
  const filePath = getCustomFilename(suffix);
  const logDir = path.dirname(filePath);
  const header = 'SEM_LOG_VERSION=2.0\nDateTime\t2D_Marker_Recognize_Position';

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(filePath, header + '\n', { encoding: 'utf8' });
  }

  const row = `${data.dateTime}\t${data.twoDMarkerRecognizePosition}`;

  fs.appendFileSync(filePath, row + '\n', { encoding: 'utf8' });
}
