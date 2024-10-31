const moment = require("moment");
const store = require("../../interfaces/stateManager");
const filesystem = require("../filesystem");
const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const http = require("http");
const wrtc = require("wrtc");
const socketIo = require("socket.io");
// const Canvas = require("canvas");
const socketClient = require("socket.io-client");
const logDB = require("../../src/db/logdb");
const stream = require("stream");
const cors = require("cors");
const schedule = require("node-schedule");
const logger = require("../log/logger");

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

const streamSocket = socketClient("http://localhost:11339");

var slamnav = null;
var taskproc = null;
var web = null;
var moveState = null;
var taskState = {
  file: "",
  running: false,
  id: 0,
};
let robotState;

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
    web_io.emit("init", { slam: robotState, move: moveState, task: taskState });
  });
});

////**********************************Slamserver */
slam_io.on("connection", (socket) => {
  socket.request = null;
  logger.info("SlamSocket Connected : " + socket.id);
  slamnav = socket;

  socket.on("lidar_cloud", (cloud) => {
    web_io.emit("lidar", cloud);
  });

  socket.on("mapping_cloud", (cloud) => {
    web_io.emit("mapping", cloud);
  });

  socket.on("local_path", (data) => {
    web_io.emit("local_path", data);
  });
  socket.on("global_path", (data) => {
    web_io.emit("global_path", data);
  });

  socket.on("status", (data) => {
    let json = JSON.parse(data);
    robotState = json;
    // console.log(json);
    web_io.emit("status", data);
  });

  socket.on("move", (data) => {
    const json = JSON.parse(data);
    moveResponse(json);
    if (json.command == "target" || json.command == "goal") {
      web_io.emit("move", json);
      moveState = json;
    } else if (json.command == "stop") {
      // moveState = null;
    }
  });

  socket.on("disconnect", () => {
    logger.info("SlamSocket Disconnected : " + socket.id);

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
    slamnav = null;
  });
});

//10초마다 DB에 state 저장
setInterval(() => {
  if (slamnav) {
    logDB.updateState(robotState);
    logDB.updatePower(robotState);
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
    taskState.file = data.file;
    taskState.id = data.id;
    taskState.running = data.running;
  });

  socket.on("move", (data) => {
    const json = JSON.parse(data);
    console.log("task move : ", json.command);
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

      taskproc.on("load", (data) => {
        if (data.result == "success") {
          taskState.file = data.file;
          resolve(data);
        } else {
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

      taskproc.on("run", (data) => {
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

      taskproc.on("stop", (data) => {
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

        slamnav.once("move", (data) => {
          resolve(data);
          clearTimeout(timeoutId);
        });

        const timeoutId = setTimeout(() => {
          reject({ ...data, result: "reject", message: "timeout" });
        }, 5000); // 5초 타임아웃
      } else if (moveState.result == "accept") {
        reject({ ...data, result: "reject", message: "already moving" });
      } else {
        console.log("moveCommand not ready");
      }
    } else {
      reject({ ...data, result: "reject", message: "disconnected" });
    }
  });
}

function sendJog(cmd, data) {
  return new Promise((resolve, reject) => {
    if (slamnav != null) {
      slamnav.emit(cmd, stringifyAllValues(data));
    } else {
      reject("disconnected");
    }
  });
}

function sendCommand(cmd, data) {
  return new Promise((resolve, reject) => {
    if (slamnav != null) {
      slamnav.emit(cmd, stringifyAllValues(data));
      slamnav.on(cmd, (data) => {
        resolve(data);
        clearTimeout(timeoutId);
      });
      const timeoutId = setTimeout(() => {
        reject();
      }, 5000); // 5초 타임아웃
    } else {
      reject("disconnected");
    }
  });
}

function emitCommand(cmd, data) {
  return new Promise((resolve, reject) => {
    if (slamnav != null) {
      slamnav.emit(cmd, stringifyAllValues(data));
      resolve(data);
    } else {
      reject("disconnected");
    }
  });
}

function Localization(data) {
  return new Promise((resolve, reject) => {
    if (slamnav != null) {
      slamnav.emit("localization", stringifyAllValues(data));

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

// let peerConnection;
// const roomId = "testCamera";
// ////*********************** Streaming Server */
// streamSocket.on("connect", () => {
//   console.log("streamSocket Connected : ", streamSocket.id);
//   streamSocket.emit("make-room", roomId);

//   const configuration = {
//     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//   };

//   // 피어 연결 생성
//   peerConnection = new wrtc.RTCPeerConnection(configuration);

//   peerConnection.onicecandidate = (event) => {
//     if (event.candidate) {
//       send({
//         event: "candidate",
//         data: event.candidate,
//       });
//       // streamSocket.emit("ice-candidate", event.candidate);
//     }
//   };

//   peerConnection.ontrack = (event) => {
//     remoteVideo.srcObject = event.streams[0]; // 원격 스트림 설정
//   };

//   // offer 수신
//   streamSocket.on("offer", (offer) => {
//     console.log("Get Offer ", offer);
//     peerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(offer));
//     peerConnection.createAnswer().then((answer) => {
//       peerConnection.setLocalDescription(answer);
//       streamSocket.emit("answer", answer);
//     });
//   });

//   // answer 수신
//   streamSocket.on("answer", (answer) => {
//     peerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(answer));
//   });

//   // ICE 후보 수신
//   streamSocket.on("ice-candidate", (candidate) => {
//     peerConnection.addIceCandidate(new wrtc.RTCIceCandidate(candidate));
//   });
//   streamSocket.on("rtc-message", async (message) => {
//     var content = JSON.parse(message);
//     console.log("RTCMessage : ", content);
//     // Offer 수신 : 누군가가 오퍼를 받음
//     if (content.event == "offer") {
//       console.log("Receive Offer", content.data);
//       var offer = content.data;
//       peerConnection.setRemoteDescription(offer); //받은 Offer SDP -> 상대 피어에 대한 원격 설정으로 저장

//       // sendImageAsStream(peerConnection, streamData);
//       // await getMedia();
//       // 상대 Peer와 공유할 미디어 트랙을 추가
//       // peerConnection.addTrack
//       // myStream
//       // .getTracks()
//       // .forEach((track) => peerConnection.addTrack(track, myStream));

//       var answer = await peerConnection.createAnswer();

//       //Answer로 자신의 SDP를 보냄
//       console.log("Send Answer");
//       send({
//         event: "answer",
//         data: answer,
//       });

//       //자신의 Local ICE Candidate를 Stun Server로부터 얻어와 등록-> onicecandidate 트리거 -> Candidate를 Socket에 Answer로 보냄
//       peerConnection.setLocalDescription(answer);
//     }

//     // Answer 수신 : 오퍼를 보내고 나서 응답이 옴
//     else if (content.event == "answer") {
//       console.log("Receive Answer");
//       answer = content.data;
//       peerConnection.setRemoteDescription(answer); //받은 Offer SDP -> 상대 피어에 대한 원격 설정으로 저장
//     }

//     // Candidate 수신
//     else if (content.event == "candidate") {
//       console.log("Receive Candidate");
//       peerConnection.addIceCandidate(content.data); //// Remote Description에 설정되어있는 Peer와의 연결방식을 결정
//     }
//   });

//   // Offer를 먼저 전송하는 버튼을 클릭했을 때 실행
//   async function createOffer() {
//     await getMedia();
//     // 상대 Peer와 공유할 미디어 트랙을 추가
//     myStream
//       .getTracks()
//       .forEach((track) => peerConnection.addTrack(track, myStream));

//     // 상대 Peer에게 보낼 SDP Offer 생성
//     var offer = await peerConnection.createOffer();

//     // 시그널링 서버로 Offer 전송
//     await send({
//       event: "offer",
//       data: offer,
//     });
//     console.log("Send Offer");

//     //자신의 Local ICE Candidate를 Stun Server로부터 얻어와 등록-> onicecandidate 트리거 -> Candidate를 Socket에 Answer로 보냄
//     peerConnection.setLocalDescription(offer);
//   }
//   // Browser의 미디어 Stream을 얻어낸다.
//   async function getMedia() {
//     try {
//       myStream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });

//       // 화면을 받고 싶은 경우
//       // myStream = await navigator.mediaDevices.getDisplayMedia({
//       //   video: {
//       //     displaySurface: "window",
//       //   },
//       // });
//       myFace.srcObject = myStream;
//     } catch (e) {
//       console.log("미디어 스트림 에러");
//     }
//   }
//   // Signaling Server에 메세지를 보내는 Function
//   async function send(message) {
//     const data = {
//       roomId: roomId,
//       ...message,
//     };
//     streamSocket.emit("rtc-message", JSON.stringify(data));
//   }
// });

module.exports = {
  Mapping: Mapping,
  Localization: Localization,
  sendCommand: sendCommand,
  emitCommand: emitCommand,
  waitMove: waitMove,
  moveCommand: moveCommand,
  loadTask: loadTask,
  runTask: runTask,
  stopTask: stopTask,
  sendJog: sendJog,
  moveResponse: moveResponse,
  getTaskFile: getTaskFile,
  getConnection: getConnection,
};
