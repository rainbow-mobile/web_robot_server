export enum FootState {
  Idle = 0,
  Init,
  Moving,
  EmoStop,
  DownDone,
  UpDone,
}

export interface FootStatus {
  connection: boolean;
  position: number;
  is_down: boolean;
  // current: number;
  foot_state: number;
}

export interface ExternalStatusPayload {
  foot: FootStatus;
}
