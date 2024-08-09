const moment = require('moment');
const store = require('../../interfaces/stateManager');
const filesystem = require("../filesystem");
const path = require("path")
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webIo = require('./web');
// const taskIo = require('./task');

const app = express();
app.use(bodyParser.json());

const Slamserver = http.createServer(app);
const Taskserver = http.createServer(app);

const slam_io = socketIo(Slamserver,{
  pingTimeout: 6000 // 2분
});
const task_io = socketIo(Taskserver,{
    pingTimeout: 6000 // 2분
});

var slamnav=null;
var taskproc=null;
var moveState = null;
var robotState;

Slamserver.listen(11337, () => {
  console.log('SLAM socket server listening on port 11337');
});
Taskserver.listen(11338, () => {
  console.log('Task socket server listening on port 11338');
});

slam_io.on('connection', (socket) => {
  socket.request = null;
  console.log('slam_io Client connected',socket.id);
  slamnav = socket;

  socket.on('lidar_cloud',(cloud) =>{
    webIo.emit("lidar",cloud);
  })
  socket.on('mapping_cloud',(cloud) =>{
    webIo.emit("mapping",cloud);
  })

  socket.on('status',(data) =>{
    console.log(data);
    
    const json = JSON.parse(data);
    robotState = json;
    webIo.emit("status",data);
  })

  socket.on('disconnect', () => {
    if(moveState && moveState.result == "accept"){
        moveResponse({
            ...moveState,
            result:'fail',
            message:'disconnected'
        });
    }
    moveState = null;
    console.log('Slam Client disconnected');
    slamnav = null;
  });
  
  socket.on('move',(data) =>{
    const json = JSON.parse(data);
    moveResponse(json);
    console.log("slamnav 1send : ",json.command, json);
    if(json.command == "target" || json.command == "goal"){
        console.log("move state changed : ",json.result);
        webIo.emit('move',json);
        moveState = json;
    }else if(json.command == "stop"){
      // moveState = null;
      console.log("move stop = null");
    }
  })
});

task_io.on('connection', (socket) =>{
    console.log('task_io Client connected',socket.id);
    taskproc = socket;
  
    socket.on('disconnect', () => {
      console.log('Client disconnected');
      taskproc = null;
    });
  
    socket.on('task_id',(data) =>{
      console.log("task id : ", data);
      webIo.emit("task_id",data);
    })
  
    socket.on('task_start',() =>{
        console.log("task start");
        webIo.emit("task","start");
    })
  
    socket.on('task_done',() =>{
        console.log("task done");
        webIo.emit("task","stop");
    })
    socket.on('task_error',() =>{
        console.log("task error");
        webIo.emit("task","error");
    })
  
    socket.on('move',(data) =>{
        const json = JSON.parse(data);
    
        console.log("task move command",json);
    
        moveCommand(json).then((data) =>{
            console.log("move Emit : ",data);
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
  
  function loadTask(path){
      return new Promise((resolve, reject) =>{
        if(taskproc != null){
          taskproc.emit("load",path);
  
          taskproc.on('load',(data) =>{
              console.log('load response : ',data);
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
  getConnection:getConnection
}
