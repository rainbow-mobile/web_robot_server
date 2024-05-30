const {spawn, exec} = require('child_process');

let process = {"test":null,"MAIN_MOBILE":null};


function startProcess(filename,path){
    return new Promise((resolve,reject) =>{
        try{
            if(process[filename]){
                reject({message:'process test already running'})
            }else{
                process[filename] = spawn(path);
                process[filename].on('exit', (code) => {
                    console.log(`process[`+filename+`] exited with code ${code}`);
                    process[filename] = null;
                });
                process[filename].on('close', (code) => {
                    console.log(`process[`+filename+`] closed with code ${code}`);
                    process[filename] = null;
                });
                resolve();
            }
        }catch(error){
            console.error(`process[`+filename+`] Error : `,error);
            reject({message:'process start failed'});
        }
    });
}
function stopProcessAll(path){
    return new Promise((resolve,reject) =>{
        try{
            const cmd = 'ps aux | grep '+path+' | awk \'{print $2}\' | xargs kill -9';
            exec(cmd);
            resolve();
        }catch(error){
            console.error("Start Process Error : ",error);
            reject({message:'process test all failed'})
        }
    });
}
async function stopProcess(filename){
    return new Promise((resolve,reject) =>{
        try{
            if(process[filename]){
                process[filename].on('exit', (code) => {
                    process[filename] = null;
                    resolve();
                });
                process[filename].on('close', (code) => {
                    process[filename] = null;
                    resolve();
                });
                process[filename].kill(9);
            }else{
                console.log("no kill")
                resolve();
            }
        }catch(error){
            console.error("Stop process[filename] Error : ",error);
            reject();
        }
    });
}

async function restartProcess(filename,path){
    return new Promise((resolve,reject) =>{
        try{
            stopProcess(filename).then(()=>{
                startProcess(filename,path).then(() =>{
                    resolve();
                }).catch((err) =>{
                    console.error(err);
                    reject({message:'process '+filename+' run failed'})
                })  
            }).catch((err) =>{
                console.error(err);
                reject();
            })
        }catch(error){
            console.error("restart '+filename+'  Error : ",error);
            reject({message:'process '+filename+'  run failed'})
        }
    });
}

module.exports = {
    startProcess: startProcess,
    stopProcess: stopProcess,
    stopProcessAll: stopProcessAll,
    restartProcess: restartProcess
}
