const moment = require("moment");
const store = require("../interfaces/stateManager");
const filesystem = require("../filesystem");
const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");
const wrtc = require("wrtc");
const os = require("os");
const socketIo = require("socket.io");
// const Canvas = require("canvas");
const socketClient = require("socket.io-client");
const logDB = require("../db/logdb");
const stream = require("stream");
const cors = require("cors");
const schedule = require("node-schedule");
const logger = require("../log/logger");
const settingdb = require("../db/settingdb");
const pako = require("pako");
const { glob } = require("fs");
const network = require("../network");

const app = express();
app.use(bodyParser.json());

const Slamserver = http.createServer(app);
const Taskserver = http.createServer(app);
const Webserver = http.createServer(app);

const slam_io = socketIo(Slamserver, {
  pingTimeout: 6000, // 2분
});
const task_io = socketIo(Taskserver, {
  pingTimeout: 6000, // 2분
});
const web_io = socketIo(Webserver, {
  pingTimeout: 6000, // 2분
});

const streamSocket = socketClient("http://localhost:11337");

streamSocket.on("connect", () => {
  console.log("test ok");
});

var slamnav = null;
var taskproc = null;
var web = null;
var moveState = null;
var taskState = {
  file: "",
  running: false,
  id: 0,
  variables: [],
};
let robotState;
let lidarCloud = {data:[]};
let GlobaPath = [];
let LocalPath = [];

Slamserver.on("error", (e) => {
  logger.error("SlamSocket Error : ", e);
});
Slamserver.listen(11337, () => {
  logger.info("SlamSocket Open -> 11337");
});

Taskserver.on("error", (e) => {
  logger.error("TaskSocket Error : ", e);
});
Taskserver.listen(11338, () => {
  logger.info("TaskSocket Open -> 11338");
});

Webserver.on("error", (e) => {
  logger.error("WebSocket Error : ", e);
});
Webserver.listen(10334, () => {
  logger.info("WebSocket Open -> 10334");
});

////**********************************Webserver */
web_io.on("connection", (socket) => {
  logger.info("WebSocket Connected : " + socket.id);

  web = socket;

  socket.on("disconnect", () => {
    logger.info("WebSocket Disconnected : " + socket.id);
  });

  socket.on("init", () => {
    console.log(
      "WebSocket Init : " +
        socket.id +
        " -> " +
        robotState +
        moveState +
        taskState
    );
    console.log(taskState.running, taskState.file);
    web_io.emit("init", {
      slam: robotState,
      move: moveState,
      task: taskState,
    });
  });
});

function getMacAddresses() {
  const networkInterfaces = os.networkInterfaces();
  const macAddresses = [];

  for (const [interfaceName, interfaces] of Object.entries(networkInterfaces)) {
    interfaces.forEach((iface) => {
      if (!iface.internal && iface.mac) {
        macAddresses.push({
          interface: interfaceName,
          mac: iface.mac,
        });
      }
    });
  }

  return macAddresses;
}

setInterval(() => {
  if (taskproc) {
    if (slamnav) {
      taskproc.emit("status", robotState);
    } else {
      taskproc.emit("status", "");
    }
  }
}, 500);

setInterval(async() => {
  if (frsSocket?.id && slamnav) {
    const lidarData = {
      robotUuid: global.robotUuid,
      data: lidarCloud
    };
    //console.log("lidar send: ",lidarCloud.data.length)
    frsSocket.emit("lidar",pako.gzip(JSON.stringify(lidarData)));

  const statusData = {
    robotUuid: global.robotUuid,
    status: robotState,
  };
  frsSocket.emit("robots-status", pako.gzip(JSON.stringify(statusData)));
  }
}, 100);


////**********************************Slamserver */
slam_io.on("connection", (socket) => {
  socket.request = null;
  logger.info("SlamSocket Connected : " + socket.id);
  slamnav = socket;
  console.log("SlamSocket Events : ",socket.eventNames());
  
  socket.on("lidar_cloud", (cloud) => {
    web_io.emit("lidar", cloud);
    lidarCloud = cloud;
  });

  socket.on("mapping_cloud", (cloud) => {
    web_io.emit("mapping", cloud);
  });

  socket.on("local_path", (data) => {
    web_io.emit("local_path", data);
    if (frsSocket != null && frsSocket.id != undefined) {
      const sendData = {
        robotUuid: global.robotUuid,
        data: data,
      };
      frsSocket.emit("local_path", pako.gzip(JSON.stringify(sendData)));
    }
  });

  socket.on("global_path", (data) => {
    web_io.emit("global_path", data);
    if (frsSocket != null && frsSocket.id != undefined) {
      const sendData = {
        robotUuid: global.robotUuid,
        data: data,
      };
      console.log("Frs Emit GlobalPath : "+data.length);
      frsSocket.emit("global_path", pako.gzip(JSON.stringify(sendData)));
    }
  });

  socket.on("status", (data) => {
    let json = JSON.parse(data);
    robotState = json;
    web_io.emit("status", data);
  });

  socket.on("move", (data) => {
    const json = JSON.parse(data);
    moveResponse(json);
    
    logger.debug("receive : move " + json.command + " -> " + json.result);
    if (json.command == "target" || json.command == "goal") {
      web_io.emit("move", json);
      
      moveState = json;
    } else if (json.command == "stop") {
      // moveState = null;
    }
  });

  socket.on("moveResponse", (data) => {
    const json = JSON.parse(data);
    moveResponse(json);
    logger.debug("receive : move " + json.command + " -> " + json.result);
    if (json.command == "target" || json.command == "goal") {
      web_io.emit("move", json);
      moveState = json;
    } else if (json.command == "stop") {
      // moveState = null;
    }
  });

  socket.on("dockResponse", (data) => {
    const json = JSON.parse(data);
    logger.info("Slamnav Dock Response : " + json.result);
    if (taskproc) {
      logger.info("send to task : " + json);
      taskproc.emit("dockResponse", json);
    }
  });

  console.log("SlamSocket Events : ",socket.eventNames());
  socket.on("disconnect", () => {
    logger.info("SlamSocket Disconnected : " + socket.id);
    slamnav = null;
    try {
      if (moveState && moveState.result == "accept") {
        moveResponse({
          ...moveState,
          result: "fail",
          message: "disconnected",
        });
      }

      if (taskState.running) {
        stopTask();
        web_io.emit("task_error", "disconnected");
      }
      taskState.running = false;
      moveState = null;
    } catch (e) {
      console.error("Socket Disconnect Error : ", e);
    }
  });
});

//10초마다 DB에 state 저장
setInterval(() => {
  if (slamnav) {
    if (robotState) {
      logDB.updateState(robotState);
      logDB.updatePower(robotState);
    }
  }
}, 10000); // 10초 간격

// 12시간 지난 데이터 삭제
schedule.scheduleJob("0 * * * *", () => {
  logDB.deleteOld();
});

////**********************************Taskserver */
task_io.on("connection", (socket) => {
  logger.info("TaskSocket Connected : " + socket.id);
  taskproc = socket;

  socket.on("disconnect", () => {
    logger.info("TaskSocket Disconnected : " + socket.id);
    taskproc = null;
  });

  socket.on("task_id", (data) => {
    taskState.id = data;
    web_io.emit("task_id", data);
  });

  socket.on("task_start", (data) => {
    logger.info("TaskSocket Start : " + data);
    taskState.running = true;
    web_io.emit("task_start", data);
  });

  socket.on("taskDock", () => {
    logger.info("TaskSocket Command : Dock");
    if (slamnav) {
      logger.info("send to Slamnav : dock");
      slamnav.emit("dock");
    }
  });

  socket.on("taskUndock", () => {
    logger.info("TaskSocket Command : Undock");
    if (slamnav) {
      logger.info("send to Slamnav : undock");
      slamnav.emit("undock");
    }
  });

  socket.on("task_done", (data) => {
    logger.info("TaskSocket Stop : " + data);
    taskState.running = null;
    taskState.id = 0;
    web_io.emit("task_done", data);
  });

  socket.on("task_error", (data) => {
    logger.error("TaskSocket Error : " + data);
    taskState.running = null;
    web_io.emit("task_error", data);
  });

  socket.on("init", (data) => {
    logger.info("TaskSocket Init : " + data.file + ", " + data.running);
    taskState.file = data.file;
    taskState.id = data.id;
    taskState.running = data.running;
    taskState.variables = JSON.parse(data.variables);
  });

  socket.on("move", (data) => {
    const json = JSON.parse(data);
    logger.debug("TaskSocket Move : " + json.command + json.id);
    moveCommand(json)
      .then((data) => {
        // web_io.emit("task", "")
      })
      .catch((err) => {
        logger.error("Move Error : ", err);
      });
  });
});

function stringifyAllValues(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      // 객체일 경우 재귀적으로 순회
      stringifyAllValues(obj[key]);
    } else {
      // 문자열로 변환하여 할당
      obj[key] = String(obj[key]);
    }
  }
  return obj;
}

function moveResponse(data) {
  if (taskproc != null) {
    taskproc.emit("move", data);
}
  if (frsSocket != null) {
    const sendData = {
      robotUuid: global.robotUuid,
      data: stringifyAllValues(data)
    };
    console.log("move frsSocket emit");
    frsSocket.emit("move", pako.gzip(JSON.stringify(sendData)));
  }
}

function getTaskFile() {
  return new Promise((resolve, reject) => {
    if (taskproc != null) {
      taskproc.emit("file");

      taskproc.on("file", (data) => {
        taskState.file = data.file;
        taskState.id = data.id;
        taskState.running = data.running;
        resolve(data);
        clearTimeout(timeoutId);
      });

      const timeoutId = setTimeout(() => {
        reject();
      }, 5000); // 5초 타임아웃
    } else {
      reject("disconnect");
    }
  });
}

function loadTask(path) {
  return new Promise((resolve, reject) => {
    if (taskproc != null) {
      taskproc.emit("load", path);
      logger.info("emit load Task : " + path);

      taskproc.on("load", (data) => {
        if (data.result == "success") {
          taskState.file = data.file;
          logger.info("load Task Success : " + data.file);
          resolve(data);
        } else {
          logger.error("load Task Failed : " + data.file);
          reject(data);
        }
        clearTimeout(timeoutId);
      });

      const timeoutId = setTimeout(() => {
        reject();
      }, 5000); // 5초 타임아웃
    } else {
      reject("disconnect");
    }
  });
}

function runTask() {
  return new Promise((resolve, reject) => {
    if (taskproc != null) {
      taskproc.emit("run");
      logger.info("emit run Task ");

      taskproc.on("run", (data) => {
        logger.info("load run Success : " + data.file);
        resolve(data);
        clearTimeout(timeoutId);
      });

      const timeoutId = setTimeout(() => {
        reject();
      }, 5000); // 5초 타임아웃
    } else {
      reject("disconnect");
    }
  });
}
function stopTask() {
  return new Promise((resolve, reject) => {
    if (taskproc != null) {
      taskproc.emit("stop");
      logger.info("emit stop Task : " + path);

      taskproc.on("stop", (data) => {
        logger.info("load stop Success : " + data.file);
        resolve(data);
        clearTimeout(timeoutId);
      });

      const timeoutId = setTimeout(() => {
        reject();
      }, 5000); // 5초 타임아웃
    } else {
      reject("disconnect");
    }
  });
}

function Mapping(data) {
  return new Promise((resolve, reject) => {
    if (slamnav != null) {
      slamnav.emit("mapping", stringifyAllValues(data));
      slamnav.once("mapping", (data) => {
        resolve(data);
        clearTimeout(timeoutId);
      });
      const timeoutId = setTimeout(() => {
        reject();
      }, 5000); // 5초 타임아웃
    } else {
      reject();
    }
  });
}

function sendCommand(cmd, data) {
  return new Promise((resolve, reject) => {
    if (slamnav != null) {
      slamnav.emit(cmd, stringifyAllValues(data));
      logger.error("Send " + cmd + " : " + stringifyAllValues(data));
      slamnav.on(cmd, (data) => {
        console.log("sendCommand on ", cmd);
        resolve(data);
        // slamnav.off(cmd);
        clearTimeout(timeoutId);
      });
      const timeoutId = setTimeout(() => {
        reject();
      }, 5000); // 5초 타임아웃
    } else {
      logger.error("Send " + cmd + " Error : Slam not connected");
      reject("disconnected");
    }
  });
}

function MapLoad(map) {
  return new Promise((resolve, reject) => {
    if (slamnav != null) {
      const time = new Date().getTime();
      logger.info("Load Map : " + map);
      slamnav.emit(
        "mapload",
        stringifyAllValues({
          name: map,
          time: time,
        })
      );

      slamnav.on("mapload", (data) => {
        resolve(data);
        clearTimeout(timeoutId);
      });
      const timeoutId = setTimeout(() => {
        console.error("?????????????????????????");
        reject();
      }, 5000); // 5초 타임아웃
    } else {
      logger.error("Send " + cmd + " Error : Slam not connected");
      reject("disconnected");
    }
  });
}

function waitMove() {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (moveState) {
        if (moveState.result == "reject") {
          clearInterval(interval);
          resolve(moveState);
          moveState = null;
        } else if (moveState.result == "fail") {
          clearInterval(interval);
          resolve(moveState);
          moveState = null;
        } else if (moveState.result == "success") {
          clearInterval(interval);
          resolve(moveState);
          moveState = null;
        } else {
        }
      } else {
        clearInterval(interval);
        reject({ result: "reject", message: "no move command" });
      }
    }, 100); // 100ms마다 상태 체크
  });
}

function isReadyMove() {
  if (moveState == null) {
    return true;
  }
  if (
    moveState.result == "reject" ||
    moveState.result == "success" ||
    moveState.result == "fail"
  ) {
    return true;
  } else {
    return false;
  }
}

function moveCommand(data) {
  return new Promise((resolve, reject) => {
    if (slamnav != null && slamnav != undefined) {
      if (isReadyMove()) {
        slamnav.emit("move", stringifyAllValues(data));
        logger.debug("moveCommand");

        slamnav.once("move", (data) => {
          resolve(data);
          clearTimeout(timeoutId);
        });
        slamnav.once("moveResponse", (data) => {
          resolve(data);
          clearTimeout(timeoutId);
        });

        const timeoutId = setTimeout(() => {
          reject({ ...data, result: "reject", message: "timeout" });
        }, 5000); // 5초 타임아웃
      } else if (moveState.result == "accept") {
        logger.debug("moveCommand Error : moveCommand already moving");
        reject({ ...data, result: "reject", message: "already moving" });
      } else {
        logger.error("moveCommand Error : moveCommand not ready");
      }
    } else {
      logger.error("moveCommand Error : Slam not connected");
      reject({ ...data, result: "reject", message: "disconnected" });
    }
  });
}

function sendJog(cmd, data) {
  return new Promise((resolve, reject) => {
    if (slamnav != null) {
      logger.debug("Send Jog : " + stringifyAllValues(data));

      slamnav.emit(cmd, stringifyAllValues(data));
    } else {
      logger.error("Send Jog Error : Slam not connected");
      reject("disconnected");
    }
  });
}

function sendCommand(cmd, data) {
  return new Promise((resolve, reject) => {
    if (slamnav != null) {
      slamnav.emit(cmd, stringifyAllValues(data));
      logger.error("Send " + cmd + " : " + stringifyAllValues(data));
      slamnav.on(cmd, (data) => {
        resolve(data);
        clearTimeout(timeoutId);
      });
      const timeoutId = setTimeout(() => {
        reject();
      }, 5000); // 5초 타임아웃
    } else {
      logger.error("Send " + cmd + " Error : Slam not connected");
      reject("disconnected");
    }
  });
}

function emitCommand(cmd, data) {
  return new Promise((resolve, reject) => {
    if (slamnav != null) {
      slamnav.emit(cmd, stringifyAllValues(data));
      logger.error("Emit " + cmd + " : " + stringifyAllValues(data));
      resolve(data);
    } else {
      logger.error("Emit " + cmd + " Error : Slam not connected");
      reject("disconnected");
    }
  });
}

function Localization(data) {
  return new Promise((resolve, reject) => {
    if (slamnav != null) {
      slamnav.emit("localization", stringifyAllValues(data));
      logger.debug("Localization :" + data.command);

      if (data.command == "start" || data.command == "stop") {
        resolve({ result: "accept", command: data.command });
        return;
      }
      slamnav.once("localization", (data) => {
        resolve(data);
        clearTimeout(timeoutId);
      });

      const timeoutId = setTimeout(() => {
        reject();
      }, 5000); // 5초 타임아웃
    } else {
      logger.error("Localization Error : Slam not connected");
      reject("disconnected");
    }
  });
}

function getConnection() {
  return {
    SLAMNAV: slamnav ? true : false,
    TASK: taskproc ? true : false,
  };
}
var frsSocket = null;

setTimeout(()=>{
  connectSocket();
},5000);
function isGzip(data) {
  // 데이터가 최소 2바이트 이상이어야 합니다.
  if (data.length < 2) {
      return false;
  }

  // 데이터의 첫 2바이트가 0x1f 0x8b인지 확인 (gzip 시그니처)
  return data[0] === 0x1f && data[1] === 0x8b;
}
const connectSocket = async () => {
  if (frsSocket) {
    frsSocket.disconnect();
    frsSocket.close();
    global.frsConnect = false;
    frsSocket = null;
  }

  const result = await network.getNetwork();
  global.ip_ethernet = result.ethernet[0]?.ip;
  global.ip_wifi = result.wifi[0]?.ip;
  console.log("result : ",  global.ip_ethernet,global.ip_wifi);
  global.frs_url = await settingdb.getVariable("frs_url");
  global.frs_socket = await settingdb.getVariable("frs_socket");
  global.frs_api = await settingdb.getVariable("frs_api");
  global.robotMcAdrs = await getMacAddresses()[0].mac;

  console.log("frs : ", global.frs_socket, global.robotMcAdrs);

  console.log("connectSocket : ",global.frs_socket)
  frsSocket = socketClient(global.frs_socket);
  frsSocket.on("connect", async () => {
    try{
      logger.info("FRS Connected : " + frsSocket.id);
  
      frsSocket.off();
      global.robotUuid = await settingdb.getVariable("robotUuid");
      global.frsConnect = true;
    
      const sendData = {
        robotMcAdrs: global.robotMcAdrs,
        robotIpAdrs: (global.ip_wifi=="" || global.ip_wifi == undefined)?global.ip_ethernet:global.ip_wifi
      };
  
      console.log("Robots Add : ",sendData);
      frsSocket.emit("robots-init", pako.gzip(JSON.stringify(sendData)));
  
      frsSocket.on("robots-init", (data) => {

        const json = JSON.parse(pako.ungzip(data, {to:'string'}));
        
        if (json.robotMcAdrs == global.robotMcAdrs) {
          logger.info(`Get UUID : uuid(${json.robotUuid}), ip(${json.robotIpAdrs}), mc(${json.robotMcAdrs}), name(${json.robotNm})`);
          global.robotNm = json.robotNm;
          global.robotUuid = json.robotUuid;
          global.robotMcAdrs = json.robotMcAdrs;
          settingdb.setVariable("robotUuid", json.robotUuid);
          settingdb.setVariable("robotName", json.robotNm);
        }
      });

      frsSocket.on("move",(data) => {
        const json = JSON.parse(pako.ungzip(data, {to:'string'}));
        logger.info(`Frs Move Command : ${json.command}, ${json.id}`);
        slamnav.emit("move",stringifyAllValues(json));
      })
    }catch(e){
      console.error(e);
    }
  });


  frsSocket.on("disconnect", () => {
    logger.info("FRS Disconnected : " + frsSocket.id);
    frsSocket.off();
    frsSocket.close();
    global.frsConnect = false;
  });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
};

module.exports = {
  Mapping: Mapping,
  Localization: Localization,
  sendCommand: sendCommand,
  emitCommand: emitCommand,
  waitMove: waitMove,
  moveCommand: moveCommand,
  loadTask: loadTask,
  runTask: runTask,
  MapLoad: MapLoad,
  stopTask: stopTask,
  sendJog: sendJog,
  moveResponse: moveResponse,
  getTaskFile: getTaskFile,
  getConnection: getConnection,
  connectSocket: connectSocket,
};
