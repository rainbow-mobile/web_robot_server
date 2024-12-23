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
    },
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
    },
  ];
  power: {
    bat_in: string;
    bat_out: string;
    bat_current: string;
    power: string;
    total_power: string;
    charge_current: string;
    contact_voltage: string;
  };
  state: {
    power: string;
    emo: string;
    charge: string;
    localization: string;
    dock: string;
    map: string;
  };
  condition: {
    auto_state: string;
    obs_state: string;
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

export const defaultStatusPayload: StatusPayload = {
  pose: {
    x: '0',
    y: '0',
    rz: '0',
  },
  vel: {
    vx: '0',
    vy: '0',
    wz: '0',
  },
  imu: {
    acc_x: '0',
    acc_y: '0',
    acc_z: '0',
    gyr_x: '0',
    gyr_y: '0',
    gyr_z: '0',
    imu_rx: '0',
    imu_ry: '0',
    imu_rz: '0',
  },
  motor: [
    {
      connection: 'false',
      status: '0',
      temp: '0',
      current: '0'
    },
    {
      connection: 'false',
      status: '0',
      temp: '0',
      current: '0'
    },
  ],
  lidar: [
    {
      connection: 'false',
      port: '',
      serialnumber: '',
    },
    {
      connection: 'false',
      serialnumber: '',
      port: '',
    },
  ],
  power: {
    bat_in: '0',
    bat_out: '0',
    bat_current: '0',
    power: '0',
    total_power: '0',
    charge_current: '0',
    contact_voltage: '0'
  },
  state: {
    power: 'false',
    dock: 'false',
    emo: 'false',
    charge: 'false',
    localization: 'none', // "none", "busy", "good", "fail"
    map: '',
  },
  condition: {
    auto_state: 'stop',
    obs_state: 'none',
    inlier_error: '0',
    inlier_ratio: '0',
    mapping_error: '0',
    mapping_ratio: '0',
  },
  setting: {
    platform_type: '',
  },
  time: '',
};
