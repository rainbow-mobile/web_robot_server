"use strict"

const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require('body-parser');
const store = require('../../interfaces/stateManager');
const slam = require('../../src/socket/slamnav');

router.use(bodyParser.json());
router.use(cors());

router.post("/jog/manual",(req,res) =>{
    // console.log(req.body);
    const time = new Date().getTime();
    slam.sendCommand("move", {
        vx:req.body.vx,
        vy: req.body.vy,
        wz: req.body.wz,
        time: time
    });
    res.send();
});

router.get("/motor/init",(req,res) =>{
    res.send(store.getState());
});

router.post('/localization',(req,res) =>{
    const time = new Date().getTime();
    console.log("localization -> ",req.body);
    slam.Localization({
        "command":req.body.command,
        "x":req.body.x,
        "y":req.body.y,
        "z":req.body.z,
        "rz":req.body.rz,
        "time":time
    }).then((data) =>{
        // console.log("startmapping get : ",data);
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send('startmapping failed')
    });
})
module.exports = router;
