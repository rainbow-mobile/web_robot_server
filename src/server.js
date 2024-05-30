const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const {spawn, exec} = require('child_process');
const process = require('../process/runTest');

const app = express();
const port = 11334;

//routers
const router_map = require("../routers/map_router");
const router_setting = require("../routers/setting_router");
const router_file = require("../routers/file_router")
const router_update = require("../routers/update_router")

app.use("/",router_file);
app.use("/",router_map);
app.use("/",router_setting);
app.use("/",router_update);
app.use(express.static('/home/rainbow/RB_MOBILE'));
app.use(express.static(path.join(__dirname,"maps")));
app.use(cors());


app.get('/start/test',(req,res) =>{
    const exePath = path.join('/home/rainbow/Desktop/Program/test');
    process.startTest(exePath).then(() =>{
        res.send(true);
    }).catch((err) =>{
        console.error("startTest error : ",err);
        res.status(500).send({message:'fail to start test'})
    });
});

  app.get('/stop/test',(req,res) =>{
    console.log("stop")
    process.stopTest().then(() =>{
        res.send(true);
    }).catch((err) =>{
        res.status(500).send(err)
    });
});

app.get('/restart/test',(req,res) =>{
    const exePath = path.join('/home/rainbow/Desktop/Program/test');
    process.restartTest(exePath).then(() =>{
        res.send(true);
    }).catch((err) =>{
        console.error(err);
        res.status(500).send(err)
    });
});
  

app.listen(port, function(){
    console.log('listening on '+port);
});
