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
    }).catch((error) =>{
        console.error(error);
    });
    res.send();
});

router.post("/control/move",(req,res) =>{
    const time = new Date().getTime();
    slam.moveCommand({
        command:req.body.command,
        x: req.body.x,
        y: req.body.y,
        z: req.body.z,
        rz: req.body.rz,
        preset: req.body.preset,
        method: req.body.method,
        id: req.body.id,
        time: time
    }).then((data) =>{
        res.send(data);
    }).catch((error) =>{
        console.error(error);
        res.send(error);
    });
    // res.send();
});

router.get("/control/move",(req,res) =>{
    console.log(req.body);
    const time = new Date().getTime();
    slam.waitMove().then((data) =>{
        res.send(data);
    }).catch((error) =>{
        console.error(error);
        res.send(error);
    })
    // res.send();
});

module.exports = router;
