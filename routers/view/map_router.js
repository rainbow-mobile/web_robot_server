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
const socket = require('../../src/socket/server');

const home_path = '/home/rainbow';
router.use(bodyParser.json({limit: '100mb'}));
router.use(bodyParser.urlencoded({limit: '100mb', extended: false}));
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
    socket.Mapping({
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
    socket.Mapping({
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
    socket.Mapping({
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

router.get('/mapping/reload',(req,res) =>{
    const time = new Date().getTime();
    socket.emitCommand('mapping',{
        "command":"reload",
        "time":time
    }).then(() =>{
        res.send();
    }).catch((err) =>{
        console.error(err);
        res.sendStatus(500);
    })
});

//맵 cloud.csv 요청
router.get('/map/cloud/:map_name',(req,res) =>{
    console.log('map cloud get');
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

//맵 cloud.csv 저장
router.post('/map/cloud/:map_name',(req,res) =>{
    console.log('map cloud save', req.body);
    const path = getCloud(req.params.map_name);

    if(Array.isArray(req.body)){
        //backup
        filesystem.existFile(path,((err,fd) =>{
            if(err){
                filesystem.saveCsv(path,req.body).then((data) =>{
                    res.send({...data, name: req.params.map_name});
                }).catch((error) =>{
                    res.send({...error, name: req.params.map_name});
                });
            }else{
                filesystem.copyFile(path).then(() =>{
                    filesystem.saveCsv(path,req.body).then((data) =>{
                        res.send({...data, name: req.params.map_name});
                    }).catch((error) =>{
                        res.send({...error, name: req.params.map_name});
                    });
                }).catch((error) =>{
                    filesystem.saveCsv(path,req.body).then((data) =>{
                        res.send({...data, name: req.params.map_name});
                    }).catch((error) =>{
                        res.send({...error, name: req.params.map_name});
                    });
                });
            }
        }));
    }else{
        console.error("Map Cloud Save Failed : data is not array")
        res.sendStatus(400);
    }
});

//맵 topo.json 요청
router.get('/map/topo/:map_name',(req,res) =>{
    console.log('map topo get');
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


//맵 topo.json 저장
router.post('/map/topo/:map_name',(req,res) =>{
    console.log('map topo post');
    const path = getTopo(req.params.map_name);

    if(req.body.length > 0){
        //backup
        filesystem.existFile(path,((err,fd) =>{
            if(err){
                filesystem.saveFile(path,req.body).then((data) =>{
                    res.send(data);
                }).catch((error) =>{
                    res.status(500).send(error);
                });
            }else{
                filesystem.copyFile(path).then(() =>{
                    filesystem.saveFile(path,req.body).then((data) =>{
                        res.send(data);
                    }).catch((error) =>{
                        res.status(500).send(error);
                    });
                }).catch((error) =>{
                    filesystem.saveFile(path,req.body).then((data) =>{
                        res.send(data);
                    }).catch((error) =>{
                        res.status(500).send(error);
                    });
                });
            }
        }));
    }else{
        res.sendStatus(400);
    }
});

//현재 맵 반환
router.get('/map/current', (req,res) =>{
    filesystem.readJson(home_path+"/config.json").then((data) =>{
        res.send(data.setting.MAP_NAME);
    }).catch((err) =>{
        console.error(err);
        res.sendStatus(500);
    })
});

//현재 맵 로드
router.post('/map/current', (req, res) =>{
    const time = new Date().getTime();
    socket.sendCommand("mapload", {
        "name":req.body.name,
        "time":time
    }).then((data) =>{
        console.log("map load success : ",data);
        res.send(data);
    }).catch((err) =>{
        console.error(err);
        res.send(err);
    });
})


//GOAL 목록 반환
router.get('/map/goal/:map_name',(req,res) =>{
    const path = getTopo(req.params.map_name);
    console.log(req.params.map_name, path);
    filesystem.existFile(path,((err,fd) =>{
        if(err){
            res.sendStatus(404);
        }else{
            filesystem.readJson(path).then((data) =>{
                let goals = [];
                data.map((node) =>{
                    if(node.type == "GOAL"){
                        goals.push(node.name);
                    }
                })
                res.send(goals);
            }).catch((error) =>{
                res.status(500).send(error);
            });
        }
    }));
})

// router.get('/getmap/:name/:file',(req,res) =>{
//     const _path = path.join(map_path,req.params.name);
//     let filepath = path.join(_path,req.params.file);
//     filesystem.existFile(filepath,((err,fd) =>{
//         if(err){
//             console.error(err);
//             res.sendStatus(404);
//         }else{
//             res.sendFile(filepath);
//         }
//     }));
// });

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


// const uploadMiddleware = upload.single('file');
// router.post('/savemap/:name/:file',uploadMiddleware, (req,res) => {
//     console.log("SAVEMAP : ",req.params.file);
//     const _path = path.join(map_path,req.params.name);
//     let filepath = path.join(_path,req.params.file);
//     try{
//         const pngfile = req.file;
//         if(!pngfile){
//             console.log("file empty");
//             res.sendStatus(400);
//             return;
//         }
//         res.send("success");
//     }catch(err){
//         if(err instanceof multer.MulterError){
//             console.log("multer error : ",err.code);
//             res.sendStatus(500);
//         }else{
//             console.log("errrror : ",err);
//             res.sendStatus(500);
//         }
//     }
// });

router.get('/map/list',(req,res) =>{
    filesystem.getMapTree(home_path + "/maps").then((result) =>{
        res.send(result);
    }).catch((error) =>{
        res.status(500).send();
    })
})

module.exports = router;
