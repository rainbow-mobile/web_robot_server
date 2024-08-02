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
app.use(bodyParser.json());

const web_io = socketIo(server);

server.listen(10334, () => {
  console.log('Web socket server listening on port 10334');
});

var test = null;

web_io.on('connection', (socket) => {
  console.log('[Mapping] Client connected');

  test = socket;
  socket.on('disconnect', () => {
    console.log('[Mapping] Client disconnected');
  });
});

function getIO(){
  return web_io;
}

function emit(cmd,data){
  if(test != null){
    // console.log("emit ",cmd,data)
    test.emit(cmd,data);
  }
}

module.exports={
  getIO:getIO,
  emit:emit
}