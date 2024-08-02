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
    const time = new Date().getTime();
    if(isNaN(Number(req.body.vx))){
        res.status(400).send();
        return;
    }
    if(isNaN(Number(req.body.vy))){
        res.status(400).send();
        return;
    }
    if(isNaN(Number(req.body.wz))){
        res.status(400).send();
        return;
    }

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

router.post("/control/move",async(req,res) =>{
    const time = new Date().getTime();
    if(req.body.command == "target"){
        if(isNaN(Number(req.body.x))){
            res.status(400).send();
            return;
        }

        if(isNaN(Number(req.body.y))){
            res.status(400).send();
            return;
        }

        if(isNaN(Number(req.body.z))){
            res.status(400).send();
            return;
        }

        if(isNaN(Number(req.body.rz))){
            res.status(400).send();
            return;
        }
        
        if(isNaN(Number(req.body.preset))){
            res.status(400).send();
            return;
        }
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
            console.log("RESOLVE : ",data);
            res.send(data);
        }).catch((data) =>{
            console.error("REJECT : ",data);
            res.send(data);
        });
    }else if(req.body.command == "goal"){
        if(req.body.id == null || req.body.id == undefined || req.body.id == ""){
            res.status(400).send();
            return;
        }

        if(isNaN(Number(req.body.preset))){
            res.status(400).send();
            return;
        }
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
            console.log("RESOLVE : ",data);
            res.send(data);
        }).catch((data) =>{
            console.error("REJECT : ",data);
            res.send(data);
        });
    }else if(["pause","resume","stop"].includes(req.body.command)){
        slam.sendCommand("move",{
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
            console.log("RESOLVE : ",data);
            res.send(data);
        }).catch((data) =>{
            console.error("REJECT : ",data);
            res.send(data);
        });
    }else{
        res.status(400).send();
        return;
    }


});

router.get("/control/move",(req,res) =>{
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
