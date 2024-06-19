const express = require('express');
const fsp = require('fs').promises;
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const axios = require('axios');

async function updateJson(path, data){
    return new Promise((resolve,reject) =>{
        if(data != undefined && data != null && data != '' && data != {} && data != []){
            fsp.writeFile(path,JSON.stringify(data,null,2),'utf-8').then((result) =>{
                resolve();
            }).catch((error) => {
                console.error("up?",error);
                reject();
            })
        }else{
            console.log("data:",data);
            reject();
        }
    })
}

async function updateFile(data){
    const url = 'http://10.108.1.10:11335/update/' + data.program + '/' + data.new_version;
    try{
        const writer = fs.createWriteStream(data.path);
        console.log(data.path, url);
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            proxy:false,
            agent: http.Agent({keepAlive:true})
        });
        response.data.pipe(writer);
        console.log(new Date());

        return new Promise((resolve, reject) =>{
            writer.on('finish',() => {
                console.log(new Date()); writer.end(); console.log("?????????????????????"); resolve('done')});
            writer.on('end',()  => { writer.end(); console.log("!!!!!!!!!!!!!!!!!!!!!"); });
            writer.on('error',(err) => { console.error(err); reject()});
        });
    }catch(error){
        console.error("UPDATEFILE ERROR",error);
    }
}

module.exports = {
    updateJson: updateJson,
    updateFile: updateFile
}
