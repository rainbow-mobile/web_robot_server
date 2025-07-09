export declare enum FormType {
    MANIPULATOR = "manipulator",
    TORSO = "torso",
    AMR = "amr"
}
export declare enum ManipulatorType {
    LEFT = "left",
    RIGHT = "right"
}
export declare enum AmrLogType {
    VELOCITY = "velocity",
    OBSTACLE = "obstacle",
    DOCKING_PRECISION = "docking_precision",
    MOVING_PRECISION = "moving_precision"
}
export declare enum GeneralOperationName {
    PROGRAM_START = "PROGRAM_START",
    PROGRAM_END = "PROGRAM_END",
    AUTORUN_START = "AUTORUN_START",
    AUTORUN_END = "AUTORUN_END",
    LOT_START = "LOT_START",
    LOT_END = "LOT_END",
    LOT_SUMMARY = "LOT_SUmmARY",
    BTN_CLICK = "BTN_CLICK",
    USER_LOGIN = "USER_LOGIN",
    PARAMETER_CHANGE = "PARAMETER_CHANGE"
}
export declare enum VehicleOperationName {
    AMR_SERVO_OFF = "AMR_SERVO_OFF",
    MOVE = "MOVE",
    READY = "READY"
}
export declare enum FootOperationName {
    MOVE = "MOVE",
    READY = "READY"
}
export declare enum ManipulatoreOperationName {
    MOVE = "MOVE",
    READY = "READY"
}
export declare enum TorsoOperationName {
    MOVE = "MOVE",
    READY = "READY"
}
export declare enum GeneralLogType {
    AUTO = "A",
    MANUAL = "M"
}
export declare enum GeneralStatus {
    RUN = "RUN",
    STOP = "STOP",
    IDLE = "IDLE",
    ERROR = "ERROR"
}
export declare enum GeneralScope {
    EVENT = "EVENT",
    VEHICLE = "Vehicle",
    MANIPULATOR = "Manipulator",
    TORSO = "Torso",
    FOOT = "Foot",
    ALARM = "ALARM"
}
export declare enum GeneralOperationStatus {
    START = "START",
    END = "END",
    SET = "SET"
}
