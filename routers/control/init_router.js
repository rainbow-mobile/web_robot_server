"use strict"

const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require('body-parser');
const store = require('../../interfaces/stateManager');
const slam = require('../../src/socket/slamnav');

router.use(bodyParser.json());
router.use(cors());

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
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send('localization failed')
    });
})

module.exports = router;
