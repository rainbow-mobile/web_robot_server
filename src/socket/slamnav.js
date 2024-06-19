const socket = require('ws');
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
    slam_socket.clients.se
}

module.exports = {
    sendJog: sendJog
}