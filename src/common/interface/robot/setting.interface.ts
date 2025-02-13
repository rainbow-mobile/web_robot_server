export interface SettingFilePayload {
    annotation:{
        ANNOT_QA_STEP: string;
    },
    cam:{
        CAM_HEIGHT_MAX:string;
        CAM_HEIGHT_MIN:string;
        CAM_TF_0:string;
        CAM_TF_1:String;
    },
    control: {
        DRIVE_EXTENDED_CONTROL_TIME: string;
        DRIVE_GOAL_APPROACH_GAIN: string;
        DRIVE_GOAL_D: string;
        DRIVE_GOAL_TH: string;
        DRIVE_V_DEADZONE: string;
        DRIVE_W_DEADZONE: string;
    },
    debug: {
        USE_SIM: string;
        USE_ARUCO: string;
        USE_BEEP: string;
        USE_BLIDAR: string;
        USE_BQR: string;
        USE_CAM: string;
        USE_EARLYSTOP: string;
        USE_FMS: string;
        USE_RRS: string;
        USE_MULTI: string;
        USE_LVX: string;
        USE_IMU: string;
        USE_QTUI: string;
        USE_RTSP: string;
        USE_WEB_UI: string;
    },
    default: {
        LIDAR_MIN_RANGE: string;
        LIDAR_MAX_RANGE: string;
        LIDAR_TF_B: string;
        LIDAR_TF_F: string;
        ROBOT_RADIUS: string;
        ROBOT_SIZE_MAX_X: string;
        ROBOT_SIZE_MAX_Y: string;
        ROBOT_SIZE_MAX_Z: string;
        ROBOT_SIZE_MIN_X: string;
        ROBOT_SIZE_MIN_Y: string;
        ROBOT_SIZE_MIN_Z: string;
        ROBOT_WHEEL_BASE: string;
        ROBOT_WHEEL_RADIUS: string;
    },
    fms: {
        SERVER_ID: string;
        SERVER_IP: string;
        SERVER_PW: string;
    },
    loc: {
        LOC_ARUCO_ODO_FUSION_DIST: string;
        LOC_ARUCO_ODO_FUSION_RATIO: string;
        LOC_CHECK_DIST: string;
        LOC_CHECK_IE: string;
        LOC_CHECK_IR: string;
        LOC_ICP_COST_THRESHOLD: string;
        LOC_ICP_COST_THRESHOLD_0: string;
        LOC_ICP_ERROR_THRESHOLD: string;
        LOC_ICP_MAX_FEATURE_NUM: string;
        LOC_ICP_ODO_FUSION_RATIO: string;
        LOC_SURFEL_NUM: string;
        LOC_SURFEL_RANGE: string;
    },
    mapping: {
        SLAM_ICP_COST_THRESHOLD: string;
        SLAM_ICP_DO_ACCUM_NUM: string;
        SLAM_ICP_DO_ERASE_GAP: string;
        SLAM_ICP_ERROR_THRESHOLD: string;
        SLAM_ICP_MAX_FEATURE_NUM: string;
        SLAM_ICP_VIEW_THRESHOLD: string;
        SLAM_KFRM_LC_TRY_DIST: string;
        SLAM_KFRM_LC_TRY_OVERLAP: string;
        SLAM_KFRM_UPDATE_NUM: string;
        SLAM_VOXEL_SIZE: string;
        SLAM_WINDOW_SIZE: string;
    },
    motor: {
        MOTOR_DIR: string;
        MOTOR_GAIN_KD: string;
        MOTOR_GAIN_KI: string;
        MOTOR_GAIN_KP: string;
        MOTOR_GEAR_RATIO: string;
        MOTOR_ID_L: string;
        MOTOR_ID_R: string;
        MOTOR_LIMIT_V: string;
        MOTOR_LIMIT_V_ACC: string;
        MOTOR_LIMIT_W: string;
        MOTOR_LIMIT_W_ACC: string;
    },
    obs: {
        OBS_AVOID: string;
        OBS_DEADZONE: string;
        OBS_LOCAL_GOAL_D: string;
        OBS_MAP_GRID_SIZE: string;
        OBS_MAP_MAX_Z: string;
        OBS_MAP_MIN_V: string;
        OBS_MAP_MIN_Z: string;
        OBS_MAP_RANGE: string;
        OBS_PATH_MARGIN_X: string;
        OBS_PATH_MARGIN_Y: string;
        OBS_PREDICT_TIME: string;
        OBS_SAFE_MARGIN_X: string;
        OBS_SAFE_MARGIN_Y: string;
    },
    robot: {
        PLATFORM_NAME: string;
        PLATFORM_TYPE: string;
    },
    lvx: {
      LVX_TF: string;
      LVX_FRM_DT: string;
      LVX_MIN_RANGE: string;
      LVX_MAX_RANGE: string;
      LVX_MAX_FEATURE_NUM: string;
      LVX_SURFEL_NN_NUM: string;
      LVX_SURFEL_RANGE: string;
      LVX_COST_THRESHOLD: string;
      LVX_INLIER_CHECK_DIST: string;
    },
    path: {
      MAP_PATH: string;
    }
}


export interface SettingJSONPayload {
    annotation:{
        ANNOT_QA_STEP: string;
    },
    cam:{
        CAM_HEIGHT_MAX:string;
        CAM_HEIGHT_MIN:string;
        CAM_TF_0_X:string;
        CAM_TF_0_Y:string;
        CAM_TF_0_Z:string;
        CAM_TF_0_RX:string;
        CAM_TF_0_RY:string;
        CAM_TF_0_RZ:string;
        CAM_TF_1_X:string;
        CAM_TF_1_Y:string;
        CAM_TF_1_Z:string;
        CAM_TF_1_RX:string;
        CAM_TF_1_RY:string;
        CAM_TF_1_RZ:string;
    },
    control: {
        DRIVE_EXTENDED_CONTROL_TIME: string;
        DRIVE_GOAL_APPROACH_GAIN: string;
        DRIVE_GOAL_D: string;
        DRIVE_GOAL_TH: string;
        DRIVE_V_DEADZONE: string;
        DRIVE_W_DEADZONE: string;
    },
    debug: {
        SIM_MODE: string;
        USE_ARUCO: string;
        USE_ARUCO_FILTER: string;
        USE_BEEP: string;
        USE_BLIDAR: string;
        USE_BQR: string;
        USE_CAM: string;
        USE_EARLYSTOP: string;
        USE_FMS: string;
        USE_IMU: string;
        USE_QT_UI: string;
        USE_RTSP: string;
        USE_WEB_UI: string;
    },
    default: {
        LIDAR_MIN_RANGE: string;
        LIDAR_MAX_RANGE: string;
        LIDAR_TF_B_X: string;
        LIDAR_TF_B_Y: string;
        LIDAR_TF_B_Z: string;
        LIDAR_TF_B_RX: string;
        LIDAR_TF_B_RY: string;
        LIDAR_TF_B_RZ: string;
        LIDAR_TF_F_X: string;
        LIDAR_TF_F_Y: string;
        LIDAR_TF_F_Z: string;
        LIDAR_TF_F_RX: string;
        LIDAR_TF_F_RY: string;
        LIDAR_TF_F_RZ: string;
        ROBOT_RADIUS: string;
        ROBOT_SIZE_MAX_X: string;
        ROBOT_SIZE_MAX_Y: string;
        ROBOT_SIZE_MAX_Z: string;
        ROBOT_SIZE_MIN_X: string;
        ROBOT_SIZE_MIN_Y: string;
        ROBOT_SIZE_MIN_Z: string;
        ROBOT_WHEEL_BASE: string;
        ROBOT_WHEEL_RADIUS: string;
    },
    fms: {
        SERVER_ID: string;
        SERVER_IP: string;
        SERVER_PW: string;
    },
    loc: {
        LOC_ARUCO_MEDIAN_NUM: string;
        LOC_ARUCO_ODO_FUSION_DIST: string;
        LOC_ARUCO_ODO_FUSION_RATIO: string;
        LOC_CHECK_DIST: string;
        LOC_CHECK_IE: string;
        LOC_CHECK_IR: string;
        LOC_ICP_COST_THRESHOLD: string;
        LOC_ICP_COST_THRESHOLD_0: string;
        LOC_ICP_ERROR_THRESHOLD: string;
        LOC_ICP_MAX_FEATURE_NUM: string;
        LOC_ICP_ODO_FUSION_RATIO: string;
        LOC_SURFEL_NUM: string;
        LOC_SURFEL_RANGE: string;
    },
    mapping: {
        SLAM_ICP_COST_THRESHOLD: string;
        SLAM_ICP_DO_ACCUM_NUM: string;
        SLAM_ICP_DO_ERASE_GAP: string;
        SLAM_ICP_ERROR_THRESHOLD: string;
        SLAM_ICP_MAX_FEATURE_NUM: string;
        SLAM_ICP_VIEW_THRESHOLD: string;
        SLAM_KFRM_LC_TRY_DIST: string;
        SLAM_KFRM_LC_TRY_OVERLAP: string;
        SLAM_KFRM_UPDATE_NUM: string;
        SLAM_VOXEL_SIZE: string;
        SLAM_WINDOW_SIZE: string;
    },
    motor: {
        MOTOR_DIR: string;
        MOTOR_GAIN_KD: string;
        MOTOR_GAIN_KI: string;
        MOTOR_GAIN_KP: string;
        MOTOR_GEAR_RATIO: string;
        MOTOR_ID_L: string;
        MOTOR_ID_R: string;
        MOTOR_LIMIT_V: string;
        MOTOR_LIMIT_V_ACC: string;
        MOTOR_LIMIT_W: string;
        MOTOR_LIMIT_W_ACC: string;
    },
    obs: {
        OBS_AVOID: string;
        OBS_DEADZONE: string;
        OBS_LOCAL_GOAL_D: string;
        OBS_MAP_GRID_SIZE: string;
        OBS_MAP_MAX_Z: string;
        OBS_MAP_MIN_V: string;
        OBS_MAP_MIN_Z: string;
        OBS_MAP_RANGE: string;
        OBS_PATH_MARGIN_X: string;
        OBS_PATH_MARGIN_Y: string;
        OBS_PREDICT_TIME: string;
        OBS_SAFE_MARGIN_X: string;
        OBS_SAFE_MARGIN_Y: string;
    },
    robot: {
        PLATFORM_NAME: string;
        PLATFORM_TYPE: string;
    }
}