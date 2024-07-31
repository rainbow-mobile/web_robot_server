const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const csv = require('fast-csv');
const uuid = require('uuid');
const { homedir } = require('os');

const findKeyword = (line) =>{
    const keyword = ['repeat','begin','wait','script','end','map','else if','if','else','move','break','continue'];
    const result = [];
    for(const key of keyword){
        if(line.includes(key)){
            result.push(key);
        }
    }
    return result[0];
}

const findValue = (line) =>{
    return line.split('(')[1].split(')')[0];
}

const textToTreeData = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
    const stack = [];
    const root = { key: '0', label: 'root', children: [] };
    
    var start_script = false;
    var script_value = '';

    stack.push(root);

    lines.forEach(line => {

        const keyword = findKeyword(line);
        const new_tree = line.includes('{');
        const end_tree = line.includes('}');

        // console.log("line : ", line, keyword, new_tree);

        if(keyword == 'begin'){
            const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
            const new_node = { label: 'begin',children: [] };
            stack[stack.length - 1].children.push(new_node); 
            // stack.push(new_node);
        }else if(keyword == 'wait'){
            const value = findValue(line);
            const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
            // const new_node = { key: uuid.v4(), realkey: key, label: 'wait', data: value, children: [] };
            const new_node = { label: 'wait', data: value, children: [] };
            stack[stack.length - 1].children.push(new_node);

        }else if(keyword == 'script'){
            start_script = true;
        }else if(keyword == 'repeat'){
            const value = findValue(line);
            const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
            // const new_node = { key: uuid.v4(), realkey: key, label: 'repeat', data: value, children: [] };
            const new_node = {label: 'repeat', data: value, children: [] };
            stack[stack.length - 1].children.push(new_node);
            stack.push(new_node);
        }else if(keyword == 'end'){
            const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
            // const new_node = { key: uuid.v4(), realkey: key, label: 'end', children: [] };
            const new_node = { label: 'end', children: [] };
            stack[stack.length - 1].children.push(new_node);
        }else if(keyword == 'move'){
            const value = findValue(line);
            const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
            const new_node = {  icon:'pi pi-fw pi-forward', key: uuid.v4(), label: 'move', data: value, children: [] };
            stack[stack.length - 1].children.push(new_node);    
        }else if(keyword == 'if'){
            const value = findValue(line);
            const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
            const new_node = { label: 'if', data: value, children: [] };
            stack[stack.length - 1].children.push(new_node);
            stack.push(new_node);            
        }else if(keyword == 'else if'){
            const value = findValue(line);
            const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
            const new_node = { label: 'else if', data: value, children: [] };
            stack[stack.length - 1].children.push(new_node);
            stack.push(new_node);            
        }else if(keyword == 'else'){
            const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
            const new_node = { label: 'else',  children: [] };
            stack[stack.length - 1].children.push(new_node);
            stack.push(new_node);            
        }else if(keyword == 'break'){
            const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
            const new_node = { label: 'break', children: [] };
            stack[stack.length - 1].children.push(new_node);
        }else if(keyword == 'continue'){
            const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
            const new_node = {label: 'continue', children: [] };
            stack[stack.length - 1].children.push(new_node);
        }else if(keyword == 'map'){
            const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
            const new_node = {label: 'map', children: [] };
            stack[stack.length - 1].children.push(new_node);
        }else{
            if(start_script){
                if(end_tree){
                    const key = stack[stack.length - 1].realkey+"-"+stack[stack.length - 1].children.length;
                    const new_node = {label: 'script', data: script_value.trimEnd(), children: [] };
                    stack[stack.length - 1].children.push(new_node);

                    start_script = false;
                    script_value = '';
                }else{
                    line.trim();
                    script_value += line + "\n";
                }
            }else if(end_tree){
                stack.pop();
            }
        }
    });

    return [root];
};

async function parse(dir){
    return new Promise(async(resolve, reject) =>{

        fs.open(dir,'r', (err,fd) =>{
            if(err){
                reject();
            }else{
                const file = fs.readFileSync(dir, 'utf-8');
        
                console.log(file);
                const result = textToTreeData(file);
        
                console.log(result);
                resolve(result);
            }
        });
    });
}

async function list(dir) {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    let list = [];

    files.map((file) =>{
        if(file.name.split('.').length>1){
            if(file.name.split('.')[1] == "task"){
                list.push(file.name);
            }
        }
    })
    return list;
}

module.exports = {
    parse:parse,
    list:list
}