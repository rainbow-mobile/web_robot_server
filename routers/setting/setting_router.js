"use strict"

const express = require("express");
const bodyParser = require('body-parser');
const path = require("path")
const cors = require("cors");
const multer = require('multer');
const router = express.Router();
const filesystem = require("../../src/filesystem");
const fs = require('fs');
const spath = require('../../setting.json');

router.use(bodyParser.json());
router.use(cors());

router.get('/setting',async(req,res) =>{
    const config_path = path.join(spath.program_path,"config","SRV","config.json");
    filesystem.readJson(config_path).then(async(data) =>{
        const ee = await transformDataToUI(data);
        res.send(ee);
    }).catch((error) =>{
        console.error(error);
        res.status(500).send(error);
    });
});

async function transformDataToUI(data){
    if(data != undefined && data != {}){
        const new_default = {
            ROBOT_SIZE_MAX_X:data.default.ROBOT_SIZE_MAX_X,
            ROBOT_SIZE_MAX_Y:data.default.ROBOT_SIZE_MAX_Y,
            ROBOT_SIZE_MAX_Z:data.default.ROBOT_SIZE_MAX_Z,
            ROBOT_SIZE_MIN_X:data.default.ROBOT_SIZE_MIN_X,
            ROBOT_SIZE_MIN_Y:data.default.ROBOT_SIZE_MIN_Y,
            ROBOT_SIZE_MIN_Z:data.default.ROBOT_SIZE_MIN_Z,
            ROBOT_RADIUS:data.default.ROBOT_RADIUS,
            ROBOT_WHEEL_BASE:data.default.ROBOT_WHEEL_BASE,
            ROBOT_WHEEL_RADIUS:data.default.ROBOT_WHEEL_RADIUS,
            LIDAR_MAX_RANGE:data.default.LIDAR_MAX_RANGE,
            LIDAR_TF_B_X:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[0]:0,
            LIDAR_TF_B_Y:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[1]:0,
            LIDAR_TF_B_Z:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[2]:0,
            LIDAR_TF_B_RX:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[3]:0,
            LIDAR_TF_B_RY:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[4]:0,
            LIDAR_TF_B_RZ:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[5]:0,
            LIDAR_TF_F_X:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[0]:0,
            LIDAR_TF_F_Y:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[1]:0,
            LIDAR_TF_F_Z:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[2]:0,
            LIDAR_TF_F_RX:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[3]:0,
            LIDAR_TF_F_RY:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[4]:0,
            LIDAR_TF_F_RZ:data.default.LIDAR_TF_B?data.default.LIDAR_TF_B.split(',')[5]:0,
        }
        const newdata = {...data, default:new_default};
        return newdata;
    }else{
        return {};
    }
}
async function transformDataToJson(data){
    if(data != undefined && data != {}){
        const lidar_tf_b = data.default.LIDAR_TF_B_X+","+data.default.LIDAR_TF_B_Y+","+data.default.LIDAR_TF_B_Z+","+data.default.LIDAR_TF_B_RX+","+data.default.LIDAR_TF_B_RY+","+data.default.LIDAR_TF_B_RZ;
        const lidar_tf_f = data.default.LIDAR_TF_F_X+","+data.default.LIDAR_TF_F_Y+","+data.default.LIDAR_TF_F_Z+","+data.default.LIDAR_TF_F_RX+","+data.default.LIDAR_TF_F_RY+","+data.default.LIDAR_TF_F_RZ;
    
        const new_default = {
            ROBOT_SIZE_MAX_X:data.default.ROBOT_SIZE_MAX_X,
            ROBOT_SIZE_MAX_Y:data.default.ROBOT_SIZE_MAX_Y,
            ROBOT_SIZE_MAX_Z:data.default.ROBOT_SIZE_MAX_Z,
            ROBOT_SIZE_MIN_X:data.default.ROBOT_SIZE_MIN_X,
            ROBOT_SIZE_MIN_Y:data.default.ROBOT_SIZE_MIN_Y,
            ROBOT_SIZE_MIN_Z:data.default.ROBOT_SIZE_MIN_Z,
            ROBOT_RADIUS:data.default.ROBOT_RADIUS,
            ROBOT_WHEEL_BASE:data.default.ROBOT_WHEEL_BASE,
            ROBOT_WHEEL_RADIUS:data.default.ROBOT_WHEEL_RADIUS,
            LIDAR_MAX_RANGE:data.default.LIDAR_MAX_RANGE,
            LIDAR_TF_B:lidar_tf_b,
            LIDAR_TF_F:lidar_tf_f
        }
        const newdata = {...data, default:new_default}
        return newdata;
    }else{
        console.log("??????????????????");
        console.log(data);
        return {};
    }
}
router.post('/setting',async(req,res) =>{
    console.log("post setting in");
    const config_path = path.join(spath.program_path,"config","SRV","config.json");
    const newbody = await transformDataToJson(req.body);
    filesystem.saveJson(config_path,newbody).then(async(data) =>{
        const ee = await transformDataToUI(data);
        console.log("/?????????????????????????");
        console.log(ee);
        res.send(ee);
    }).catch((error) =>{
        res.status(500).send(error);
    })
})

router.get('/setting/preset/list',(req,res) =>{
    filesystem.getPresetList().then((data) =>{
        res.send(data);
    }).catch((error) =>{
        console.error(error);
        res.status(500).send();
    })
});

router.delete('/setting/preset/:id',async(req,res) =>{
    if(req.params.id == null || req.params.id == undefined){
        res.status(400).send();
    }else{
        const filename = "preset_"+req.params.id+".json";
        const config_path = path.join("/home","rainbow",filename);
        filesystem.deleteFile(config_path).then(() =>{
            filesystem.getPresetList().then((data) =>{
                res.send(data);
            }).catch((error) =>{
                console.error(error);
                res.send();
            })
        }).catch((err) =>{
            console.log(err);
            res.status(500).send(err);
        })

    }
})

router.get('/setting/preset/:id',async(req,res) =>{
    if(req.params.id == null || req.params.id == undefined){
        res.status(400).send();
    }else{
        const filename = "preset_"+req.params.id+".json";
        const config_path = path.join("/home","rainbow",filename);
        filesystem.readJson(config_path).then(async(data) =>{
            res.send(data);
        }).catch((error) =>{
            console.error(error);
            res.status(500).send(error);
        });
    }
});

router.get('/setting/preset/add/:id', (req,res) =>{
    if(req.params.id == null || req.params.id == undefined){
        res.status(400).send();
    }else{
        const filename = "preset_"+req.params.id+".json";
        const config_path = path.join("/home","rainbow",filename);
        filesystem.makeTempPreset(config_path).then(async(data) =>{
            res.send(data);
        }).catch((error) =>{
            console.error(error);
            res.status(500).send(error);
        });
    }
})
router.post('/setting/preset/add/:id', (req,res) =>{
    if(req.params.id == null || req.params.id == undefined){
        res.status(400).send();
    }else{
        const filename = "preset_"+req.params.id+".json";
        const config_path = path.join("/home","rainbow",filename);
        filesystem.saveJson(config_path,req.body).then(async(data) =>{
            res.send(data);
        }).catch((error) =>{
            console.error(error);
            res.status(500).send(error);
        });
    }
})
router.post('/setting/preset/:id',async(req,res) =>{
    if(req.params.id == null || req.params.id == undefined){
        res.status(400).send();
    }else{
        const filename = "preset_"+req.params.id+".json";
        const config_path = path.join("/home","rainbow",filename);
        filesystem.saveJson(config_path,req.body).then(async(data) =>{
            res.send(data);
        }).catch((error) =>{
            console.error(error);
            res.status(500).send(error);
        });
    }
});
module.exports = router;