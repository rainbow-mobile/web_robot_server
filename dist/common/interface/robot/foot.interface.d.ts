export declare enum FootState {
    Idle = 0,
    Init = 1,
    Moving = 2,
    EmoStop = 3,
    DownDone = 4,
    UpDone = 5
}
export interface FootStatus {
    connection: boolean;
    position: number;
    is_down: boolean;
    foot_state: number;
}
export interface ExternalStatusPayload {
    foot: FootStatus;
}
