class StateManager {
    constructor() {
      if (!StateManager.instance) {
        this.state = { 
            time: "",
            pose: {
                x: "0",
                y: "0",
                rz: "0"
            },
            vel: {
                vx: "0",
                vy: "0",
                wz: "0"
            },
            motor:[
                {
                    connection: "false",
                    status: "4",
                    temp: "0",
                },
                {
                    connection: "false",
                    status: "0",
                    temp: "0",
                }
            ],
            power:{
                bat_in: "0",
                bat_out: "0",
                bat_current: "0",
                power: "0",
                total_power: "0"
            },
            state:{
                power: "false",
                emo: "false",
                charge: "false",
                localization: "none", // "none", "busy", "good", "fail"
            },	
            condition:{
                inlier_error: "0",
                inlier_ratio: "0"
            }	
        };
        StateManager.instance = this;
      }
      return StateManager.instance;
    }
  
    getState() {
      return this.state;
    }
  
    setState(newState) {
      console.log(newState);
      const state = JSON.parse(newState);
      this.state = { ...this.state, ...state };
    }
  }
  
  const instance = new StateManager();
//   Object.freeze(instance);
  
  module.exports = instance;