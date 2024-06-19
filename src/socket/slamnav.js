const socket = require('ws');
const moment = require('moment');
const store = require('../../interfaces/stateManager');

const slam_socket = new socket.Server({port:8111});

slam_socket.on('connection',(socket) =>{
    console.log("connected");

    socket.on('message', (message) => {
        // JSON 데이터 처리
        let receivedData;
        try {
            receivedData = JSON.parse(message);
            // console.log(store)
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

function sendJog(data){
    console.log(data.time);
    const time = new Date(data.time).getTime();
    // console.log(new Date(data.time),d);
    // const date = moment(d);
    // const date_str = date.format('YYYY-MM-DD HH:mm:ss.SSS').toString();
    // console.log(date,date_str);

    console.log({...data,time:time});
    slam_socket.socket?.send({...data,time:time});
}

module.exports = {
    sendJog: sendJog
}