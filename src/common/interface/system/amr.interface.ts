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
