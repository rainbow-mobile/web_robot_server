"use strict"

const express = require("express");
const bodyParser = require('body-parser');
// const ini = require('ini');
const path = require("path")
const cors = require("cors");
const router = express.Router();
const fs = require('fs');
const network = require('../../src/network');

router.use(bodyParser.json());
router.use(cors());


router.get('/network/current',(req,res) =>{
    network.getNetwork().then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.sendStatus(500);
    })
})
router.get('/network/wifi/list',(req,res) =>{
    network.getWifiList().then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.sendStatus(500);
    })
})
router.get('/network/wifi/scan',(req,res) =>{
    network.scan().then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.sendStatus(500);
    })
})
router.put('/network/ethernet',(req,res)=>{
    console.log(req.body);
    res.send();
})

router.post('/network/wifi',(req,res) =>{
    console.log("============ Network Wifi Change");
    console.log(req.body);

    network.connectWifi(req.body).then((data)=>{
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.sendStatus(500);
    })
})

module.exports = router;