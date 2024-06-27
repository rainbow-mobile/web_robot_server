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

const map_path = '/home/rainbow/map';
const home_path = '/home/rainbow';
router.use(bodyParser.json());
router.use(cors());
router.use(compression())

function getCloud(name){
    return path.join(home_path,"maps",name,"cloud.csv").toString();
}
function getTopo(name){
    return path.join(home_path,"maps",name,"topo.json").toString();
}

//매핑 시작 요청
router.get('/mapping/start',async(req,res) =>{
    const time = new Date().getTime();
    slam.Mapping({
        "command":"start",
        "time":time
    }).then((data) =>{
        // console.log("startmapping get : ",data);
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send('startmapping failed')
    });
});

//매핑 종료 요청
router.get('/mapping/stop',async(req,res) =>{
    const time = new Date().getTime();
    slam.Mapping({
        "command":"stop",
        "time":time
    }).then((data) =>{
        // console.log("stopmapping get : ",data);
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send('stopmapping failed')
    });
});

//매핑 종료(저장) 요청
router.get('/mapping/save/:name',async(req,res) =>{
    const time = new Date().getTime();
    slam.Mapping({
        "command":"save",
        "name":req.params.name,
        "time":time
    }).then((data) =>{
        // console.log("savemapping get : ",data);
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send('savemapping failed')
    });
});



//맵 cloud.csv 요청
router.get('/map/cloud/:map_name',(req,res) =>{
    const path = getCloud(req.params.map_name);
    filesystem.existFile(path,((err,fd) =>{
        if(err){
            res.sendStatus(404);
        }else{
            filesystem.readCsv(path).then((data) =>{
                console.log("data:",data);
                res.send(data);
            }).catch((error) =>{
                res.status(500).send(error);
            });
        }
    }));
});

//맵 topo.json 요청
router.get('/map/topo/:map_name',(req,res) =>{
    const path = getTopo(req.params.map_name);
    filesystem.existFile(path,((err,fd) =>{
        if(err){
            res.sendStatus(404);
        }else{
            filesystem.readJson(path).then((data) =>{
                res.send(data);
            }).catch((error) =>{
                res.status(500).send(error);
            });
        }
    }));
});



router.get('/getmap/:name/list',(req,res) =>{
    
});

router.get('/getmap/:name/:file',(req,res) =>{
    const _path = path.join(map_path,req.params.name);
    let filepath = path.join(_path,req.params.file);
    filesystem.existFile(filepath,((err,fd) =>{
        if(err){
            console.error(err);
            res.sendStatus(404);
        }else{
            res.sendFile(filepath);
        }
    }));
});

const upload = multer({
    storage: multer.diskStorage({
      	filename(req, file, done) {
			done(null, req.params.file);
        },
		destination(req, file,done){
		    done(null, path.join(map_path, req.params.name));
	    },
    }),
    limits: {fileSize: 1024*1024},
});


const uploadMiddleware = upload.single('file');
router.post('/savemap/:name/:file',uploadMiddleware, (req,res) => {
    console.log("SAVEMAP : ",req.params.file);
    const _path = path.join(map_path,req.params.name);
    let filepath = path.join(_path,req.params.file);
    console.log("??????????????????????");
    try{
        const pngfile = req.file;
        if(!pngfile){
            console.log("file empty");
            res.sendStatus(400);
            return;
        }
        res.send("success");
    }catch(err){
        if(err instanceof multer.MulterError){
            console.log("multer error : ",err.code);
            res.sendStatus(500);
        }else{
            console.log("errrror : ",err);
            res.sendStatus(500);
        }
    }
});

router.get('/map/list',(req,res) =>{
    filesystem.getDirectoryTree(map_path).then((result) =>{
        res.send(result);
    }).catch((error) =>{
        res.status(500).send();
    })
})

module.exports = router;