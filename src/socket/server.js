const moment = require('moment');
const store = require('../../interfaces/stateManager');
const filesystem = require("../filesystem");
const path = require("path")
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const logDB = require('../../src/db/logdb');
const schedule = require('node-schedule');

const app = express();
app.use(bodyParser.json());

const Slamserver = http.createServer(app);
const Taskserver = http.createServer(app);
const Webserver = http.createServer(app);

const slam_io = socketIo(Slamserver,{
  pingTimeout: 6000 // 2분
});
const task_io = socketIo(Taskserver,{
    pingTimeout: 6000 // 2분
});
const web_io = socketIo(Webserver,{
    pingTimeout: 6000 // 2분
});

var slamnav=null;
var taskproc=null;
var web=null;
var moveState = null;
var taskState = {
  file:'',
  running:false,
  id:0
};
let robotState;

Slamserver.listen(11337, () => {
  console.log('Slamserver listening on port 11337');
});
Taskserver.listen(11338, () => {
  console.log('Taskserver listening on port 11338');
});
Webserver.listen(10334, () => {
  console.log('Webserver listening on port 10334');
});

////**********************************Webserver */
web_io.on('connection', (socket) => {
  console.log('Webserver Client connected : ',socket.id);

  web = socket;
  socket.on('disconnect', () => {
    console.log('Webserver Client disconnected : ',socket.id);
  });

  socket.on('init',() =>{
    console.log(taskState, moveState, robotState);
    web_io.emit("init", {slam:robotState,move:moveState,task:taskState});
  });
});

////**********************************Slamserver */
slam_io.on('connection', (socket) => {
  socket.request = null;
  console.log('Slamserver Client connected : ',socket.id);
  slamnav = socket;

  socket.on('lidar_cloud',(cloud) =>{
    web_io.emit("lidar",cloud);
  })

  socket.on('mapping_cloud',(cloud) =>{
    web_io.emit("mapping",cloud);
  })

  
  socket.on('local_path',(data) =>{
    web_io.emit("local_path",data);
  })
  socket.on('global_path',(data) =>{
    web_io.emit("global_path",data);
  })



  socket.on('status',(data) =>{
    let json = JSON.parse(data);
    robotState = json;
    web_io.emit("status",data);
  })

  socket.on('move',(data) =>{
    const json = JSON.parse(data);
    moveResponse(json);
    console.log("slamnav 1send : ",json.command, json);
    if(json.command == "target" || json.command == "goal"){
        console.log("move state changed : ",json.result);
        web_io.emit('move',json);
        moveState = json;
    }else if(json.command == "stop"){
      // moveState = null;
      console.log("move stop = null");
    }
  })

  socket.on('disconnect', () => {
    if(moveState && moveState.result == "accept"){
        moveResponse({
            ...moveState,
            result:'fail',
            message:'disconnected'
        });
    }
    if(taskState.running){
      stopTask();
      web_io.emit("task_error","disconnected");
    }
    taskState.running = false;
    moveState = null;
    console.log('Slamserver Client disconnected : ',socket.id);
    slamnav = null;
  });
  
});

//10초마다 DB에 state 저장
setInterval(() => {
  if(slamnav){
    logDB.updateState(robotState);
    logDB.updatePower(robotState);
  }
}, 10000); // 10초 간격

// 12시간 지난 데이터 삭제
schedule.scheduleJob('0 * * * *', () => {
  logDB.deleteOld();
});


////**********************************Taskserver */
task_io.on('connection', (socket) =>{
    console.log('Taskserver Client connected : ',socket.id);
    taskproc = socket;
  
    socket.on('disconnect', () => {
      console.log('Taskserver Client disconnected : ',socket.id);
      taskproc = null;
    });
  
    socket.on('task_id',(data) =>{
      console.log("task id : ", data);
      taskState.id = data;
      web_io.emit("task_id",data);
    })
  
    socket.on('task_start',(data) =>{
        console.log("task start",data);
        taskState.running = true;
        web_io.emit("task_start",data);
    })
  
    socket.on('task_done',(data) =>{
        console.log("task done");
        taskState.running = null;
        taskState.id = 0;
        web_io.emit("task_done",data);
    })

    socket.on('task_error',(data) =>{
        console.log("task error");
        taskState.running = null;
        web_io.emit("task_error",data);
    })
  
    socket.on('init',(data) =>{
      console.log('task file response : ',data);
      taskState.file = data.file;
      taskState.id = data.id;
      taskState.running = data.running;
    })
    
    socket.on('move',(data) =>{
        const json = JSON.parse(data);
        console.log("task move command",json);
        moveCommand(json).then((data) =>{
            console.log("move Emit : ",data);
            // web_io.emit("task", "")
        }).catch((err) =>{
            console.error("move Error : ",err);
        })
    })
})

function stringifyAllValues(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        // 객체일 경우 재귀적으로 순회
        stringifyAllValues(obj[key]);
      } else {
        // 문자열로 변환하여 할당
        obj[key] = String(obj[key]);
      }
    }
    return obj;
}

function moveResponse(data){
    if(taskproc != null){
      taskproc.emit("move",data);
    }
  }
  
  function getTaskFile(){
    return new Promise((resolve, reject) =>{
      if(taskproc != null){
        taskproc.emit("file");

        taskproc.on('file',(data) =>{
            console.log('task file response : ',data);
            taskState.file = data.file;
            taskState.id = data.id;
            taskState.running = data.running;
            resolve(data);
            clearTimeout(timeoutId);
        })

        const timeoutId = setTimeout(() => {
            console.log("timeout?");
            reject();
        }, 5000); // 5초 타임아웃
      }else{
        reject("disconnect");
      }
    })
  }


  function loadTask(path){
      return new Promise((resolve, reject) =>{
        if(taskproc != null){
          taskproc.emit("load",path);
  
          taskproc.on('load',(data) =>{
            if(data.result == 'success'){
              console.log('load task : success',data);
              taskState.file = data.file;
              resolve(data);
            }else{
              reject(data);
            }
            clearTimeout(timeoutId);
          })
  
          const timeoutId = setTimeout(() => {
              console.log("timeout?");
              reject();
          }, 5000); // 5초 타임아웃
        }else{
          reject("disconnect");
        }
      })
    }
  
    function runTask(){
      return new Promise((resolve, reject) =>{
          if(taskproc != null){
              taskproc.emit("run");
      
              taskproc.on('run',(data) =>{
                  console.log('run response : ',data);
                  resolve(data);
                  clearTimeout(timeoutId);
              })
      
              const timeoutId = setTimeout(() => {
                  console.log("timeout?");
                  reject();
              }, 5000); // 5초 타임아웃
          }else{
              console.log("discon?");
              reject("disconnect");
          }
      })
    }
    function stopTask(){
      return new Promise((resolve, reject) =>{
          if(taskproc != null){
              taskproc.emit("stop");
      
              taskproc.on('stop',(data) =>{
                  console.log('stop response : ',data);
                  resolve(data);
                  clearTimeout(timeoutId);
              })
      
              const timeoutId = setTimeout(() => {
                  console.log("timeout?");
                  reject();
              }, 5000); // 5초 타임아웃
          }else{
              console.log("discon?");
              reject("disconnect");
          }
      })
    }

function Mapping(data){
    return new Promise((resolve, reject) =>{
      console.log("Mapping ddd",data)
        if(slamnav != null){
            slamnav.emit('mapping',stringifyAllValues(data));
            slamnav.once('mapping',(data) =>{
                // console.log("response : ",data);
                resolve(data);
                clearTimeout(timeoutId);
            })
            const timeoutId = setTimeout(() => {
                console.log("timeout?");
                reject();
            }, 5000); // 5초 타임아웃
        }else{
            reject();
        }
    })
}

function waitMove(){
  return new Promise((resolve, reject) =>{
    console.log("waitMove");
    const interval = setInterval(() => {
      if(moveState){
        if(moveState.result == 'reject'){
          console.log("moveState reject : ", moveState);
          clearInterval(interval);
          resolve(moveState);
          moveState = null;
        }else if(moveState.result == 'fail'){
          console.log("moveState failed : ", moveState);
          clearInterval(interval);
          resolve(moveState);
          moveState = null;
        }else if(moveState.result == 'success'){
          console.log("moveState success : ", moveState);
          clearInterval(interval);
          resolve(moveState);
          moveState = null;
        }else{
        }
      }else{
        clearInterval(interval);
        reject({result:"reject",message:"no move command"});
      }
  }, 100); // 100ms마다 상태 체크
  })
}

function isReadyMove(){
  if(moveState == null){
    return true;
  }if(moveState.result == 'reject' || moveState.result == 'success' || moveState.result == 'fail'){
      return true;
  }else{
    return false;
  }
}

function moveCommand(data){
  return new Promise((resolve, reject) =>{
    console.log("moveCommand",data);
    if(slamnav != null && slamnav != undefined){
      if(isReadyMove()){
        slamnav.emit('move',stringifyAllValues(data));

        slamnav.once('move',(data) =>{
            resolve(data);
            clearTimeout(timeoutId);
        })

        const timeoutId = setTimeout(() => {
            reject({...data, result:'reject', message: 'timeout'});
        }, 5000); // 5초 타임아웃
      }else if(moveState.result == 'accept'){
        console.log(robotState.condition.auto_state);
        reject({...data, result:'reject', message: 'already moving'})
      }
    }else{
      console.log("discon");
      reject({...data, result:'reject', message: 'disconnected'});
    }
  })
}

function sendCommand(cmd, data){
  return new Promise((resolve, reject) =>{
    console.log(cmd,data);
    if(slamnav != null){
      slamnav.emit(cmd,stringifyAllValues(data));
      slamnav.on(cmd,(data) =>{
          resolve(data);
          clearTimeout(timeoutId);
      })
      const timeoutId = setTimeout(() => {
          console.log("timeout?");
          reject();
      }, 5000); // 5초 타임아웃
    }else{
      console.log("discon");
      reject("disconnected");
    }
  })
}

function emitCommand(cmd, data){
  return new Promise((resolve, reject) =>{
    console.log("emit ",cmd,data);
    if(slamnav != null){
      slamnav.emit(cmd,stringifyAllValues(data));
      resolve(data);
    }else{
      console.log("discon");
      reject("disconnected");
    }
  })
}

function Localization(data){
    return new Promise((resolve, reject) =>{
        if(slamnav != null){
            slamnav.emit('localization',stringifyAllValues(data));
    
            slamnav.once('localization',(data) =>{
                resolve(data);
                clearTimeout(timeoutId);
            })

            const timeoutId = setTimeout(() => {
                console.log("timeout?");
                reject();
            }, 5000); // 5초 타임아웃
        }else{
          console.log("discon");
            reject("disconnected");
        }
    })
}

function getConnection(){
    return({
        "SLAMNAV":slamnav?true:false,
        "TASK":taskproc?true:false
    })
}


module.exports={
  Mapping:Mapping,
  Localization:Localization,
  sendCommand:sendCommand,
  emitCommand:emitCommand,
  waitMove:waitMove,
  moveCommand:moveCommand,
  loadTask:loadTask,
  runTask:runTask,
  stopTask:stopTask,
  moveResponse:moveResponse,
  getTaskFile:getTaskFile,
  getConnection:getConnection
}
