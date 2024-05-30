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
const process = require('../process/runTest.js');
const spath = require('../setting.json');

const update_path = spath.update_path;
const log_path = spath.log_path;
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
        if(req.body.auth == undefined || req.body.program == undefined || req.body.new_version == undefined){
            console.log("???dddd?????");
            res.status(400).send({message:'Required body is missing',body:req.body});
        }else if(req.body.program == "" || req.body.new_version == "0.0.0" || req.body.path == ""){
            console.log("????????");
            res.status(401).send({message:'Required body is missing',body:req.body});
        }else{
            var logjson = new Object();
            const date = moment();
            const date_str = date.format('YYYY-MM-DD HH:mm:ss').toString();

            logjson["date"] = date_str;
            logjson["author"] = req.body.auth;
            logjson["prev_version"] = req.body.cur_version;
            logjson["new_version"] = req.body.new_version;

            process.stopProcess(req.body.program).then(() =>{
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
    
                    console.log("start");
                    process.restartProcess(req.body.path)
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
        res.status(500).send({message:'Failed',error:error,body:req.body});
    }
});


router.get('/start/:filename',(req,res) =>{
    const exePath = path.join(spath.program_path+'/'+req.params.filename);
    process.startProcess(req.params.filename,exePath).then(() =>{
        res.send(true);
    }).catch((err) =>{
        console.error("startProcess error : ",err);
        res.status(500).send(err)
    });
});

router.get('/stop/:filename',(req,res) =>{
    const exePath = path.join(spath.program_path+'/'+req.params.filename);
    process.stopProcess(req.params.filename).then(() =>{
        res.send(true);
    }).catch((err) =>{
        console.log("stopProcess error : ",err);
        res.status(500).send(err)
    });
});

router.get('/restart/:filename',(req,res) =>{
    const exePath = path.join(spath.program_path+'/'+req.params.filename);
    process.restartProcess(req.params.filename,exePath).then(() =>{
        res.send(true);
    }).catch((err) =>{
        console.error("restartProcess error : ",err);
        res.status(500).send(err)
    });
});
  

module.exports = router;