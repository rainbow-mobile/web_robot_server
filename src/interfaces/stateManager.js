class StateManager {
  constructor() {
    if (!StateManager.instance) {
      this.state = {
        pose: {
          x: "0",
          y: "0",
          rz: "0",
        },
        vel: {
          vx: "0",
          vy: "0",
          wz: "0",
        },
        imu: {
          acc_x: "0",
          acc_y: "0",
          acc_z: "0",
          gyr_x: "0",
          gyr_y: "0",
          gyr_z: "0",
          imu_rx: "0",
          imu_ry: "0",
          imu_rz: "0",
        },
        motor: [
          {
            connection: "false",
            status: "0",
            temp: "0",
          },
          {
            connection: "false",
            status: "0",
            temp: "0",
          },
        ],
        lidar: [
          {
            connection: "false",
            port: "",
            serialnumber: "",
          },
          {
            connection: "false",
            serialnumber: "",
            port: "",
          },
        ],
        power: {
          bat_in: "0",
          bat_out: "0",
          bat_current: "0",
          power: "0",
          total_power: "0",
        },
        state: {
          power: "false",
          emo: "false",
          charge: "false",
          localization: "none", // "none", "busy", "good", "fail"
          map: "",
        },
        condition: {
          audo_state: "stop",
          obs_state: "none",
          inlier_error: "0",
          inlier_ratio: "0",
          mapping_error: "0",
          mapping_ratio: "0",
        },
        setting: {
          platform_type: "",
        },
      };
      StateManager.instance = this;
    }
    return StateManager.instance;
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    // console.log(newState);
    const state = JSON.parse(newState);
    this.state = { ...this.state, ...state };
  }
}

const instance = new StateManager();
//   Object.freeze(instance);

module.exports = instance;
