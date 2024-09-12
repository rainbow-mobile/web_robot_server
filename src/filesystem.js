const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const csv = require('fast-csv');
const { homedir } = require('os');


async function getDirEntry(dir,callback) {
    fs.readdir(dir,callback);
};

//폴더 내 모든 파일+폴더 반환
async function getMapList(dir,father={list:[]}) {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        const fullPath = path.join(dir, file.name);
        const stats = await fs.promises.stat(fullPath);
        const model = {name:file.name,modifiedDate:stats.mtime,list:[]};
        const models = await getMapList(fullPath, model);  // 재귀 호출
        father.list.push(models);
      }else{
        if(father.length != 0){
            const fullPath = path.join(dir, file.name);
            const stats = await fs.promises.stat(fullPath);
            father.list.push({name:file.name,modifiedDate:stats.mtime});
        }
      }
    }
    return father;
}

//맵 폴더 반환
async function getMapList2(dir,father={list:[]}) {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        const fullPath = path.join(dir, file.name);
        const stats = await fs.promises.stat(fullPath);
        const model = {name:file.name,modifiedDate:stats.mtime,list:[]};
        const models = await getMapList2(fullPath, model);  // 재귀 호출
        if(models.list.find(obj => obj.name === "cloud.csv"))
            father.list.push(models);
      }else{
        if(father.length != 0){
            if(file.name == "cloud.csv" || file.name == "topo.json"){
                const fullPath = path.join(dir, file.name);
                const stats = await fs.promises.stat(fullPath);
                father.list.push({name:file.name,modifiedDate:stats.mtime});
            }
        }
      }
    }
    return father;
}

async function getPresetList(){
    return new Promise(async(resolve, reject) =>{
        try{
            const nums = [];
            const files = await fs.promises.readdir("/home/rainbow", { withFileTypes: true });
            for(const file of files){
                if(!file.isDirectory()){
                    if(file.name.split('.')[0].split('_')[0] == "preset"){
                        if(file.name.split('.')[0].split('_').length > 1){
                            const num = parseInt(file.name.split('.')[0].split('_')[1]);
                            const newname = "preset_"+num+".json";
                            if(file.name == newname){
                                nums.push(num);
                            }
                        }
                    }
                }
            }
            resolve(nums);
        }catch(error){
            console.error(error);
            reject();
        }
    });
}
  
async function getMapTree(dir){
    return new Promise(async(resolve, reject) =>{
        try{
            const directories = await getMapList2(dir);
            resolve(directories.list);   
        }catch(error){
            console.error(error);
            reject();
        }
    })
}

async function getDirectoryTree(dir){
    return new Promise(async(resolve, reject) =>{
        try{
            const directories = await getMapList(dir);
            resolve(directories);   
        }catch(error){
            console.error(error);
            reject();
        }
    })
}

async function saveFile(filepath, filedata){
    return new Promise(async(resolve, reject) =>{
        try{
            console.log("saveFile");
            // JSON 데이터를 파일로 저장
            fs.writeFile(filepath, JSON.stringify(filedata, null, 2), (err) => {
              if (err) {
                console.error('파일 저장 중 오류 발생:', err);
                reject();
              }
              console.log("write success: ",filedata);
              resolve(filedata);
            });
        }catch(error){
            console.error(error);
            reject(error);
        }
    })
}

async function copyFile(filepath){
    return new Promise(async(resolve, reject) =>{
        try{
            // JSON 데이터를 파일로 저장
            fs.copyFile(filepath, filepath+".backup", (err) => {
              if (err) {
                console.error('파일 저장 중 오류 발생:', err);
                reject();
              }
              console.log("copy success: ");
              resolve();
            });
        }catch(error){
            console.error(error);
            reject(error);
        }
    })
}

function stringifyAllValues(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        // 객체일 경우 재귀적으로 순회
        stringifyAllValues(obj[key]);
      } else {
        // 문자열로 변환하여 할당
        obj[key] = String(obj[key]);
      }
    }
    return obj;
}


async function saveJson(filepath, jsondata){
    return new Promise(async(resolve, reject) =>{
        try{
            // JSON 데이터를 파일로 저장
            const stringifiedObj = stringifyAllValues(jsondata);
            fs.writeFile(filepath, JSON.stringify(stringifiedObj, null, 2), (err) => {
                if (err) {
                    console.error('파일 저장 중 오류 발생:', err);
                    reject({
                        result: "fail",
                        message: err
                    });
                }
                console.log("write success: ",stringifiedObj);
                resolve(jsondata);
            });
        }catch(error){
            console.error(error);
            reject({
                result:"fail",
                message: error
            });
        }
    })
}

async function deleteFile(filepath){
    return new Promise(async(resolve, reject) =>{
        try{
            fs.unlink(filepath, (err)=>{
                if(err){
                    reject({
                        result: "fail",
                        message: err
                    });
                }else{
                    console.log("delete success");
                    resolve({
                        result: "success"
                    });
                }
            });
        }catch(error){
            console.error(error);
            reject({
                result: "fail",
                message: error
            });
        }
    })
}

async function readJson(filepath, callback){
    return new Promise(async(resolve, reject) =>{
        try{
            const filecontent = fs.readFileSync(filepath, 'utf-8');
            const jsonData = JSON.parse(filecontent);
            resolve(jsonData);
        }catch(error){
            console.error(error);
            reject({
                result: "fail",
                message: error
            });
        }
    })
};

async function makeTempPreset(filepath){
    return new Promise(async(resolve, reject) =>{
        try{
            // JSON 데이터를 파일로 저장
            const tempdata = {
                LIMIT_V:0,
                LIMIT_W:0,
                LIMIT_V_ACC:0,
                LIMIT_W_ACC:0,
                LIMIT_PIVOT_W:0,
                PP_MIN_LD:0,
                PP_MAX_LD:0,
                PP_ST_V:0,
                PP_ED_V:0
            };
            const stringifiedObj = stringifyAllValues(tempdata);
            fs.writeFile(filepath, JSON.stringify(stringifiedObj, null, 2), (err) => {
              if (err) {
                console.error('파일 저장 중 오류 발생:', err);
                reject();
              }
              console.log("write success: ",stringifiedObj);
              resolve(tempdata);
            });
        }catch(error){
            console.error(error);
            reject(error);
        }
    });
}

async function changeFilename(filepath, newpath){

}

async function readCsv(filepath, callback){
    return new Promise((resolve, reject) =>{
        try{
            const results = [];
            const filecontent = fs.createReadStream(filepath)
                .pipe(csv.parse({headers:false}))
                .on('data',(data) =>results.push(data))
                .on('end',() =>{
                    resolve(results);
                })
        }catch(error){
            console.error(error);
            reject(error);
        }
    })
};

async function saveCsv(filepath, filedata){
    return new Promise(async(resolve, reject) =>{
        try{
            console.log("saveCsv", filedata);
            // JSON 데이터를 CSV 파일로 변환
            const csvData = filedata.map(row => row.join(',')).join('\n');
            
            // JSON 데이터를 파일로 저장
            fs.writeFile(filepath, csvData, (err) => {
              if (err) {
                console.error('파일 저장 중 오류 발생:', err);
                reject({
                    result: "fail",
                    message: err
                });
              }
              console.log("write success: ",filedata);
              resolve({
                result: "success"
              });
            });
        }catch(error){
            console.error(error);
            reject({
                result: "fail",
                message: error
            });
        }
    })
}

async function existFile(filepath, callback){
    fs.open(filepath,'r', callback);
}

module.exports = {
    existFile: existFile,
    getDirEntry: getDirEntry,
    readJson: readJson,
    copyFile:copyFile,
    saveFile:saveFile,
    saveCsv:saveCsv,
    getDirectoryTree:getDirectoryTree,
    readCsv: readCsv,
    makeTempPreset:makeTempPreset,
    changeFilename,changeFilename,
    deleteFile:deleteFile,
    saveJson:saveJson,
    getMapTree:getMapTree,
    getPresetList:getPresetList
}
