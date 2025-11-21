export interface StatusPayload {
    pose: {
        x: string;
        y: string;
        rz: string;
    };
    vel: {
        vx: string;
        vy: string;
        wz: string;
    };
    imu: {
        acc_x: string;
        acc_y: string;
        acc_z: string;
        gyr_x: string;
        gyr_y: string;
        gyr_z: string;
        imu_rx: string;
        imu_ry: string;
        imu_rz: string;
    };
    motor: [
        {
            connection: string;
            status: string;
            temp: string;
            current: string;
        },
        {
            connection: string;
            status: string;
            temp: string;
            current: string;
        }
    ];
    lidar: [
        {
            connection: string;
            port: string;
            serialnumber: string;
        },
        {
            connection: string;
            serialnumber: string;
            port: string;
        }
    ];
    power: {
        bat_in: string;
        bat_out: string;
        bat_current: string;
        bat_percent: string;
        power: string;
        total_power: string;
        charge_current: string;
        contact_voltage: string;
    };
    robot_state: {
        power: string;
        emo: string;
        charge: string;
        localization: string;
        dock: string;
    };
    move_state: {
        auto_move: string;
        dock_move: string;
        jog_move: string;
        obs: string;
        path: string;
    };
    goal_node: {
        id: string;
        name: string;
        state: string;
        x: string;
        y: string;
        rz: string;
    };
    cur_node: {
        id: string;
        name: string;
        state: string;
        x: string;
        y: string;
        rz: string;
    };
    map: {
        map_name: string;
        map_status: string;
    };
    condition: {
        inlier_error: string;
        inlier_ratio: string;
        mapping_error: string;
        mapping_ratio: string;
    };
    setting: {
        platform_type: string;
    };
    time: string;
}
