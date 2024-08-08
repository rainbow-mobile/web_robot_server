"use strict"

const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require('body-parser');
const store = require('../../interfaces/stateManager');
const socket = require('../../src/socket/server');

router.use(bodyParser.json());
router.use(cors());

//need update
router.get("/motor/init",(req,res) =>{
    res.send('not updated yet');
});

router.post('/localization',(req,res) =>{
    const time = new Date().getTime();
    console.log("localization -> ",req.body);
    socket.Localization({
        "command":req.body.command,
        "x":req.body.x,
        "y":req.body.y,
        "z":req.body.z,
        "rz":req.body.rz,
        "time":time
    }).then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send('localization failed')
    });
})

router.get("/connection",(req,res) =>{
    res.send(socket.getConnection());
})
module.exports = router;
