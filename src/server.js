const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const {spawn, exec} = require('child_process');
const process = require('../process/runTest');
const monitor = require('./monitor');
const compression = require('compression');
const network = require('../src/network');
const app = express();
app.use(compression());
const port = 11334;
const WebSocket = require('ws');


//routers
const router_map = require("../routers/view/map_router");
const router_setting = require("../routers/setting/setting_router");
const router_file = require("../routers/setting/file_router")
const router_update = require("../routers/setting/update_router")
const router_status = require("../routers/view/status_router");
const router_network = require('../routers/setting/network_router')
const router_control = require('../routers/control/control_router')

const slamnav_socket = require('../src/socket/slamnav');

app.use("/",router_file);
app.use("/",router_map);
app.use("/",router_setting);
app.use("/",router_update);
app.use("/",router_status);
app.use("/",router_network);
app.use("/",router_control);
app.use(express.static('/home/rainbow/RB_MOBILE'));
app.use(express.static(path.join(__dirname,"maps")));
app.use(cors());

const qtServerUrl = 'ws://127.0.0.1:10333'; // Qt 서버 주소
const port1 = 10334;
// const wss = new WebSocket.Server({ port: port1 });

// wss.on('connection', function connection(ws) {
//     console.log('Client connected');

//     const qtSocket = new WebSocket(qtServerUrl);

//     qtSocket.on('open', function open() {
//         console.log('Connected to Qt server');
//     });

//     qtSocket.on('message', function message(data) {
//         ws.send(data);
//     });

//     qtSocket.on('close', function close() {
//         console.log('Disconnected from Qt server');
//         ws.close();
//     });

//     ws.on('close', function close() {
//         console.log('Client disconnected');
//         qtSocket.close();
//     });
// });


// test();

// function test(){
//     try{
//         const qtSocket = new WebSocket(qtServerUrl);
//         qtSocket.on('open', function open() {
//             console.log('Connected to Qt server');
//         });
    
//         qtSocket.on('message', function message(data) {
//             console.log(data);
//         });

//         qtSocket.on('error', function error(error){
//             console.error(error);
//         })
    
//         qtSocket.on('close', function close() {
//             console.log('Disconnected from Qt server');
//             // ws.close();
//         });  

//         console.log(`WebSocket intermediary server running on ws://localhost:${port1}`);
              
//     }catch(err){
//         console.error("EEEEEEEEE",err);
//     }


// }


network.scan();
monitor.getServerInfo();

app.listen(port, function(){
    console.log('listening on '+port);
});


app.get('/', (req, res) => {
    // PrimeReact 컴포넌트를 포함한 React 애플리케이션을 서버 측에서 렌더링
    const appHtml = ReactDOMServer.renderToString(
        // React.createElement(PrimeComponent)
    );

    // 서버에서 생성된 HTML을 클라이언트에 전송
    res.send(`
        <html>
            <head>
                <title>MobileServer</title>
                <link rel="stylesheet" type="text/css" href="/styles.css">
            </head>
            <body>
                <div id="app">${appHtml}</div>
                <script src="/client.js"></script>
            </body>
        </html>
    `);
});
