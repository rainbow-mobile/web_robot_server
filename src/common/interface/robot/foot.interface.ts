export enum FootState {
  Idle = 0,
  Init,
  Processing,
  Moving,
  Done,
}

export interface FootStatus {
  id: number;
  connection: boolean;
  position: number;
  current: number;
  foot_state: number;
}

export interface ExternalStatusPayload {
  foot: FootStatus[];
}
