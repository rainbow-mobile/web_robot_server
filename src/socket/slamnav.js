const socket = require('ws');
const moment = require('moment');
const store = require('../../interfaces/stateManager');

const slam_socket = new socket.Server({port:8111});
var slam;

slam_socket.on('open',function open(){
    console.log("websocket connected");
})
slam_socket.on('connection',(socket) =>{
    console.log("connected");
    slam = socket;

    socket.on('message', (message) => {
        // JSON 데이터 처리
        let receivedData;
        try {
            receivedData = JSON.parse(message);
            store.setState(receivedData);
        } catch (e) {
            console.error('Invalid JSON:', e);
            return;
        }
        // JSON 형식으로 응답 전송
        socket.send("thank you");
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });    

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
function sendJog(data){
    console.log(data.time);
    const time = new Date(data.time).getTime();
    // console.log(new Date(data.time),d);
    // const date = moment(d);
    // const date_str = date.format('YYYY-MM-DD HH:mm:ss.SSS').toString();
    // console.log(date,date_str);
    const stringifiedObj = stringifyAllValues({...data,time:time});
        
    console.log(stringifiedObj);

    slam_socket.clients.forEach(client=>{
        client.send(JSON.stringify(stringifiedObj));
    });
}


module.exports = {
    sendJog:sendJog
}