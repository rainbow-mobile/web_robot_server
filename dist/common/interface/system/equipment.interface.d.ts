export interface ManipulatorPositionPayload {
    dateTime: string;
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
    base: number;
    shoulder: number;
    elbow: number;
    wrist1: number;
    wrist2: number;
}
export interface TorsoPositionPayload {
    dateTime: string;
    x: number;
    z: number;
    theta: number;
}
export interface AmrVelocityPayload {
    dateTime: string;
    x: number;
    y: number;
    theta: number;
    xVel: number;
    yVel: number;
}
export interface AmrObstaclePayload {
    dateTime: string;
    statusFront: boolean;
    distanceFront: number;
    thetaFront: number;
    statusBack: boolean;
    distanceBack: number;
    thetaBack: number;
}
export interface AmrDockingPrecisionPayload {
    dateTime: string;
    twoDMarkerRecognizePosition: number;
}
export interface AmrMovingPrecisionPayload {
    dateTime: string;
    twoDMarkerRecognizePosition: number;
}
