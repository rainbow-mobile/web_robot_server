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

const task = require('../../src/socket/task');

router.use(bodyParser.json());
router.use(cors());
router.use(compression())

const work_path = '/home/rainbow/Downloads/script_task/map_editer/build/work';

router.get('/task',(req,res) =>{
    parser.list(work_path).then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send(err);
    })
})

router.get('/task/run',(req,res) =>{
    console.log("task runnnnnnnnn");
    task.runTask().then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.error("error?",err);
        res.send(err);
    })
})
router.get('/task/stop',(req,res) =>{
    task.stopTask().then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.error("error?",err);
        res.send(err);
    })
})


router.get('/task/pause',(req,res) =>{
    console.log("task pause");
    res.send("no function");
})
router.get('/task/:name',(req,res) =>{
    parser.parse(path.join(work_path,req.params.name)).then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send(err);
    })
})

router.post('/task/:name',(req,res) =>{
    parser.save(path.join(work_path,req.params.name),req.body).then((data) =>{
        console.log("task save");
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send(err);
    })
})

router.get('/task/load/:name',(req,res) =>{
    task.loadTask(path.join(work_path,req.params.name)).then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send(err);
    })
})


module.exports = router;