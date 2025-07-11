export enum FormType {
  MANIPULATOR = 'manipulator',
  TORSO = 'torso',
  AMR = 'amr',
}

export enum ManipulatorType {
  LEFT = 'left',
  RIGHT = 'right',
}

export enum AmrLogType {
  VELOCITY = 'velocity',
  OBSTACLE = 'obstacle',
  DOCKING_PRECISION = 'docking_precision',
  MOVING_PRECISION = 'moving_precision',
}

export enum GeneralOperationName {
  PROGRAM_START = 'PROGRAM_START',
  PROGRAM_END = 'PROGRAM_END',
  AUTORUN_START = 'AUTORUN_START',
  AUTORUN_END = 'AUTORUN_END',
  LOT_START = 'LOT_START',
  LOT_END = 'LOT_END',
  LOT_SUMMARY = 'LOT_SUmmARY',
  BTN_CLICK = 'BTN_CLICK',
  USER_LOGIN = 'USER_LOGIN',
  PARAMETER_CHANGE = 'PARAMETER_CHANGE',
}

export enum VehicleOperationName {
  AMR_SERVO_OFF = 'AMR_SERVO_OFF',
  MOVE = 'Move',
  READY = 'READY',
}

export enum FootOperationName {
  MOVE = 'Move',
  READY = 'READY',
}

export enum ManipulatoreOperationName {
  MOVE = 'Move',
  READY = 'READY',
}

export enum TorsoOperationName {
  MOVE = 'Move',
  READY = 'READY',
}

export enum GeneralLogType {
  AUTO = 'A',
  MANUAL = 'M',
}

export enum GeneralStatus {
  RUN = 'RUN',
  STOP = 'STOP',
  IDLE = 'IDLE',
  ERROR = 'ERROR',
}

export enum GeneralScope {
  EVENT = 'EVENT',
  VEHICLE = 'Vehicle',
  MANIPULATOR = 'Manipulator',
  TORSO = 'Torso',
  FOOT = 'Foot',
  ALARM = 'ALARM',
}

export enum GeneralOperationStatus {
  START = 'START',
  END = 'END',
  SET = 'SET',
}
