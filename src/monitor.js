const express = require('express');
const fs = require('fs');
const axios = require('axios');
const network = require('network');
const moment = require('moment')
let mac_address;
const _url = 'http://10.108.1.10:11335/';

var info;
var now_status;

var TIME_SEND = 1000;
var sendThread = setInterval(checkSleep, TIME_SEND);

async function getServerInfo(){
    if(mac_address == undefined){
        getMacAddress().then(async(result) =>{
            mac_address = result;
            try{
                const url = _url+"robotlist/"+mac_address;
                const response = await axios.get(url);
                info = response.data;
                console.log("===========  GET SERVER INFO   =============");
                console.log("mac address = ",mac_address);
                console.log("robotId = ",response.data.id);
                console.log("robotName = ",response.data.name);
                console.log("============================================");
            }catch(error){
                console.error("getServerInfo catch error");
            }
        }).catch((err) =>{
            console.error("getServerInfo getMacAddress error");
        })
    }else{
        try{
            const url = _url+"info/"+mac_address;
            const response = await axios.get(url);
            console.log("=========== GET SERVER INFO(Re) =============");
            console.log("mac address = ",mac_address);
            console.log("robotId = ",response.data.id);
            console.log("robotName = ",response.data.name);
            console.log("=============================================");
        }catch(error){
            console.error(error);
        }
    }
};

async function getMacAddress(){
    return new Promise((resolve, reject) =>{
        try{
            network.get_interfaces_list((err, faces) =>{
                faces.forEach(element => {
                    if(element.type == "Wireless"){
                        resolve(element.mac_address);
                    }
                });
                reject();
            })
        }catch(err){
            reject(err);
        }
    });
}

function createData(){
    return{
        id: info.id,
        battery: now_status.battery,
        date: now_status.date
    };
}

async function postData(){
    if(info && now_status){
        const data = createData();
        try{
            const response = await axios.post(_url+"status",data);
        }catch(error){
            console.error(error);
        }
    }
}

async function checkSleep(){
    if(info && now_status){
        if(moment.duration(moment().diff(moment(now_status.date))).seconds() < 3){
            postData();
        }
    }else{

    }
}

function setStatus(_status){
    now_status = _status;
}
module.exports = {
    getServerInfo: getServerInfo,
    getMacAddress:getMacAddress,
    setStatus:setStatus
}
