const moment = require('moment');
const store = require('../../interfaces/stateManager');
const filesystem = require("../filesystem");
const path = require("path")
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const server2 = http.createServer(app);


const slam_io = socketIo(server,{
  pingTimeout: 6000 // 2분
});

const mapping_io = socketIo(server2);

var slamnav=null;

server.listen(11337, () => {
  console.log('SLAM socket server listening on port 11337');
});

server2.listen(10334, () => {
  console.log('Mapping socket server listening on port 10334');
});

slam_io.on('connection', (socket) => {
  console.log('slam_io Client connected',socket.id);
  console.log(slam_io.ma)

  slamnav = socket;

  socket.on('mapping_cloud',(cloud) =>{
      mapping_io.emit("mapping",cloud);
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    slamnav = null;
  });
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
    return obj;
  }


function Mapping(data){
    return new Promise((resolve, reject) =>{
        if(slamnav != null){
            slamnav.emit('mapping',data);
    
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
function sendCommand(data){
    slamnav.emit(data.command,data.body);
}

function Localization(data){
    return new Promise((resolve, reject) =>{
        if(slamnav != null){
            slamnav.emit('localization',data);
    
            slamnav.once('localization',(data) =>{
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


module.exports={
  Mapping:Mapping,
  Localization:Localization,
  sendCommand:sendCommand
}
