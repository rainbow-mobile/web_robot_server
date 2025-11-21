export declare enum MotionCommand {
    MOTION_GATE = "motionGate"
}
export declare enum MotionMethod {
    SITTING = "sitting",
    STANDING = "standing",
    AIMING = "aiming",
    TROTTING = "trotting",
    TROT_STAIRS = "trot_stairs",
    WAVING = "waving",
    TROT_RUNNING = "trot_running",
    DOOR_OPENING = "door_opening",
    ZMP_INITIALIZING = "zmp_initializing"
}
export declare class MotionCommandDto {
    command: 'motionGate';
    method: 'sitting' | 'standing' | 'aiming' | 'trotting' | 'trot_stairs' | 'waving' | 'trot_running' | 'door_opening' | 'zmp_initializing';
}
