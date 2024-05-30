"use strict"

const express = require("express");
const bodyParser = require('body-parser');
const path = require("path")
const cors = require("cors");
const multer = require('multer');
const router = express.Router();
const filesystem = require("../src/filesystem");
const fs = require('fs');

const config_path = '/home/rainbow/Desktop/config.json';

router.use(bodyParser.json());
router.use(cors());

router.get('/setting',(req,res) =>{
    filesystem.readJson(config_path).then((data) =>{
        res.send(data);
    }).catch((error) =>{
        res.status(500).send(error);
    });
});

router.post('/setting',(req,res) =>{
    console.log(req.body);
    res.send();
})

module.exports = router;