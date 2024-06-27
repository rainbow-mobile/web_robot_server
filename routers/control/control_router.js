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
    slam.sendCommand(req.body);
    res.send();
});

router.get("/motor/init",(req,res) =>{
    res.send(store.getState());
});

router.post('/localization',(req,res) =>{
    const time = new Date().getTime();
    slam.Localization({
        "command":req.body.command,
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
