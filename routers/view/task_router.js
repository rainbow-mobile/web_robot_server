"use strict"

const express = require("express");
const bodyParser = require('body-parser');
// const ini = require('ini');
const path = require("path")
const cors = require("cors");
const multer = require('multer');
const router = express.Router();
const filesystem = require("../../src/filesystem");
const fs = require('fs');
const compression = require('compression')
const slam = require('../../src/socket/slamnav');
const parser = require('../../src/task/parser');
const home_path = '/home/rainbow';

router.use(bodyParser.json());
router.use(cors());
router.use(compression())

router.get('/task',(req,res) =>{
    parser.parse('/home/rainbow/Downloads/script_task/map_editer/build/work/test3.task').then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send(err);
    })
})
module.exports = router;