const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const csv = require('fast-csv');
const { homedir } = require('os');

const findKeyword = (line) =>{
    const keyword = ['repeat','begin','wait','script','end'];
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
    const root = { key: '0', keyword: 'root', label: 'Task', children: [] };
    
    var start_script = false;
    var script_value = '';

    stack.push(root);

    lines.forEach(line => {

        const keyword = findKeyword(line);
        const new_tree = line.includes('{');
        const end_tree = line.includes('}');

        // console.log("line : ", line, keyword, new_tree);

        if(keyword == 'begin'){
            const new_node = { key: stack[stack.length - 1].key+"-"+stack[stack.length - 1].children.length, keyword: 'begin', label: keyword, children: [] };
            stack[stack.length - 1].children.push(new_node);
            // stack.push(new_node);
        }else if(keyword == 'wait'){
            const value = findValue(line);

            const new_node = { key: stack[stack.length - 1].key+"-"+stack[stack.length - 1].children.length, keyword: 'wait', label: keyword+" "+value, value: value, children: [] };
            stack[stack.length - 1].children.push(new_node);

        }else if(keyword == 'script'){
            start_script = true;
        }else if(keyword == 'repeat'){
            const value = findValue(line);
            const new_node = { key: stack[stack.length - 1].key+"-"+stack[stack.length - 1].children.length, keyword: 'repeat', label: keyword+" "+value, value: value, children: [] };
            stack[stack.length - 1].children.push(new_node);
            stack.push(new_node);
        }else if(keyword == 'end'){
            const new_node = { key: stack[stack.length - 1].key+"-"+stack[stack.length - 1].children.length, keyword: 'end', label: keyword, children: [] };
            stack[stack.length - 1].children.push(new_node);
        }else{
            if(start_script){
                if(end_tree){
                    const new_node = { key: stack[stack.length - 1].key+"-"+stack[stack.length - 1].children.length, keyword: 'script', label: keyword, value: script_value.trimEnd(), children: [] };
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
        const file = fs.readFileSync(dir, 'utf-8');

        console.log(file);
        const result = textToTreeData(file);

        console.log(result);
        resolve(result);
    });
}

module.exports = {
    parse:parse
}