"use strict"
const express = require("express");
const bodyParser = require('body-parser');
const path = require("path")
const cors = require("cors");
const multer = require('multer');
const router = express.Router();
const filesystem = require("../../src/filesystem");
const fs = require('fs');
const moment = require('moment');
const update = require('../../src/update.js');
const process = require('../../process/runTest.js');
const spath = require('../../setting.json');
const db = require('../../src/version.js')
const monitor = require('../../src/monitor.js')
const store = require('../../interfaces/stateManager');

router.use(bodyParser.json());
router.use(cors());

router.post('/status',async(req,res) =>{
    const date = moment();
    const date_str = date.format('YYYY-MM-DD HH:mm:ss').toString();
    monitor.setStatus({...req.body,date:date_str});
    res.send();
})

router.get('/status',(req,res) =>{
    res.send(store.getState());
})


module.exports = router;