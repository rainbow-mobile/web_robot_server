const express = require('express');
const fs = require('fs');
const axios = require('axios');


async function getDirEntry(dir,callback) {
    fs.readdir(dir,callback);
};

async function readJson(filepath, callback){
    return new Promise((resolve, reject) =>{
        try{
            const filecontent = fs.readFileSync(filepath, 'utf-8');
            const jsonData = JSON.parse(filecontent);
            console.log(jsonData);
            resolve(jsonData);
        }catch(error){
            console.error(error);
            reject(error);
        }
    })
};
async function existFile(filepath, callback){
    console.log(filepath);
    fs.open(filepath,'r', callback);
}


module.exports = {
    existFile: existFile,
    getDirEntry: getDirEntry,
    readJson: readJson
}
