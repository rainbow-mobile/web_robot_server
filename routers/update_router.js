"use strict"
const express = require("express");
const bodyParser = require('body-parser');
const path = require("path")
const cors = require("cors");
const multer = require('multer');
const router = express.Router();
const filesystem = require("../src/filesystem");
const fs = require('fs');
const moment = require('moment');
const update = require('../src/update.js');
const process = require('../process/runTest.js')

const update_path = '/home/rainbow/Desktop/Program/update.json';
const log_path = '/home/rainbow/Desktop/Program/log.json';
const update_json = require(update_path);
const log_json = require(log_path);


router.use(bodyParser.json());
router.use(cors());
  
router.get('/versions/:filename',(req,res) =>{
    if(req.params.filename != ''){
        const data = update_json[req.params.filename];
        console.log(data);
        res.send({data:data,filename:req.params.filename});
    }else{
        res.status(400).send({message:'params filename is missing',filename:req.params.filename})
    }
})


router.post('/update',(req,res) =>{
    try{
        console.log(req.body);
        if(req.body.auth == undefined || req.body.program == undefined || req.body.new_version == undefined || req.body.auth == undefined){
            console.log("???dddd?????");
            res.status(400).send({message:'Required body is missing',body:req.body});
        }else if(req.body.program == "" || req.body.new_version == "0.0.0" || req.body.path == ""){
            console.log("????????");
            res.status(401).send({message:'Required body is missing',body:req.body});
        }else{
            console.log(req.body);
            var logjson = new Object();
            const date = moment();
            const date_str = date.format('YYYY-MM-DD HH:mm:ss').toString();

            logjson["date"] = date_str;
            logjson["author"] = req.body.auth;
            logjson["prev_version"] = req.body.cur_version;
            logjson["new_version"] = req.body.new_version;

            process.stopTest().then(() =>{
                update.updateFile(req.body).then((result) =>{
                    console.log('File Download and updated successfully ',result);
    
                    //json set
                    update_json[req.body.program].prev_version = update_json[req.body.program].version;
                    update_json[req.body.program].version = req.body.new_version;
                    update_json[req.body.program].date = date_str;
    
                    logjson["result"] = 'success';
    
                    const ff = req.body.program;
                    if(Array.isArray(log_json[ff])){
                        log_json[ff].push(logjson);
                    }
    
                    res.send({message:'update successfully done',log:logjson});
    
                    update.updateJson(log_path,log_json).then((result) =>{
                    }).catch((error) =>{
                        console.error("UpdateJson : ",error);
                    })
                    update.updateJson(update_path,update_json).then((result) =>{
                    }).catch((error) =>{
                        console.error("UpdateJson : ",error);
                    })
    
                    if(req.body.program == "test"){
                        console.log("start");
                        process.restartTest('/home/rainbow/Desktop/Program/test')
                    }
                    console.log("done");
                }).catch((error) =>{
                    console.log("updatefile error :",log_path,logjson,log_json);
                    logjson["result"] = 'failed';
                    const ff = req.body.program;
                    
                    if(Array.isArray(log_json[ff])){
                        log_json[ff].push(logjson);
                    }

                    update.updateJson(log_path,log_json).then((result) =>{
                    }).catch((error) =>{
                        console.error("UpdateJson : ",error);
                    })
    
                    console.error("UpdateFile : ", error);
                    res.status(500).send({message:'Got Error',error:error});
                });
            }).catch((err) =>{
                console.error("stopTest error : ", err);
            })
        }

    }catch(error){
        console.error("Post : ",error);
        res.status(500).send({message:'Required body is missing',body:req.body});
    }
});


router.get('/start/test',(req,res) =>{
    const exePath = path.join('/home/rainbow/Desktop/Program/test');
    process.startTest(exePath).then(() =>{
        res.send(true);
    }).catch((err) =>{
        console.error("startTest error : ",err);
        res.status(500).send(err)
    });
});

router.get('/stop/test',(req,res) =>{
    const exePath = path.join('/home/rainbow/Desktop/Program/test');
    process.stopTest(exePath).then(() =>{
        console.log("?");
        res.send(true);
    }).catch((err) =>{
        console.log("err?",err);
        res.status(500).send(err)
    });
});

router.get('/restart/test',(req,res) =>{
    const exePath = path.join('/home/rainbow/Desktop/Program/test');
    process.restartTest(exePath).then(() =>{
        res.send(true);
    }).catch((err) =>{
        console.error(err);
        res.status(500).send(err)
    });
});
  

module.exports = router;