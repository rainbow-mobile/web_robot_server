const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const {spawn, exec} = require('child_process');
const process = require('../process/runTest');
const monitor = require('./monitor');

const app = express();
const port = 11334;


//routers
const router_map = require("../routers/map_router");
const router_setting = require("../routers/setting_router");
const router_file = require("../routers/file_router")
const router_update = require("../routers/update_router")
const router_status = require("../routers/status_router");

app.use("/",router_file);
app.use("/",router_map);
app.use("/",router_setting);
app.use("/",router_update);
app.use("/",router_status);
app.use(express.static('/home/rainbow/RB_MOBILE'));
app.use(express.static(path.join(__dirname,"maps")));
app.use(cors());


monitor.getServerInfo();

app.listen(port, function(){
    console.log('listening on '+port);
});

