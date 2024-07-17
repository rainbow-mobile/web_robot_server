const moment = require('moment');
const store = require('../../interfaces/stateManager');
const filesystem = require("../filesystem");
const path = require("path")
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const server2 = http.createServer(app);
app.use(bodyParser.json());


const slam_io = socketIo(server,{
  pingTimeout: 6000 // 2분
});

const mapping_io = socketIo(server2);

var slamnav=null;
var moveState = null;

server.listen(11337, () => {
  console.log('SLAM socket server listening on port 11337');
});

server2.listen(10334, () => {
  console.log('Mapping socket server listening on port 10334');
});

slam_io.on('connection', (socket) => {
  socket.request = null;
  console.log('slam_io Client connected',socket.id);
  slamnav = socket;

  socket.on('lidar_cloud',(cloud) =>{
      mapping_io.emit("lidar",cloud);
  })
  socket.on('mapping_cloud',(cloud) =>{
      mapping_io.emit("mapping",cloud);
  })

  socket.on('status',(data) =>{
    store.setState(data);
    mapping_io.emit("status",data);
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    slamnav = null;
  });

  slamnav.on('move',(data) =>{
    moveState = JSON.parse(data);
    console.log("move state changed : ",moveState.result);
  })
});


mapping_io.on('connection', (socket) => {
  console.log('[Mapping] Client connected');


  socket.on('disconnect', () => {
    console.log('[Mapping] Client disconnected');
  });
});

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
    console.log("output : ",obj);
    return obj;
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
          console.log("moveState changed resolve : ", moveState);
          clearInterval(interval);
          resolve(moveState);
          moveState = null;
        }else{
          // console.log(moveState.result);
        }
      }else{
        console.log("moveState null");
        clearInterval(interval);
        reject({result:"reject",message:"no move command"});
      }
  }, 100); // 100ms마다 상태 체크
  })
}

function moveCommand(data){
  return new Promise((resolve, reject) =>{
    console.log(data, slamnav);
    if(slamnav != null && slamnav != undefined){
      slamnav.emit('move',stringifyAllValues(data));
      slamnav.once('move',(data) =>{
          resolve(data);
          clearTimeout(timeoutId);
      })
      const timeoutId = setTimeout(() => {
          console.log("timeout?");
          moveState = 'reject';
          reject({...data, result:'reject', message: 'timeout'});
      }, 5000); // 5초 타임아웃
    }else{
      console.log("reject?");
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
      reject();
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
      reject();
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
            reject();
        }
    })
}


module.exports={
  Mapping:Mapping,
  Localization:Localization,
  sendCommand:sendCommand,
  emitCommand:emitCommand,
  waitMove:waitMove,
  moveCommand:moveCommand
}
