const moment = require('moment');
const store = require('../../interfaces/stateManager');
const filesystem = require("../filesystem");
const path = require("path")
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webIo = require('./web')

const app = express();
app.use(bodyParser.json());

var taskproc=null;
const server = http.createServer(app);
const task_io = socketIo(server,{
  pingTimeout: 6000 // 2분
});
server.listen(11338, () => {
  console.log('Task socket server listening on port 11338');
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
})


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
  module.exports={
    loadTask:loadTask,
    runTask:runTask,
    stopTask:stopTask
  }