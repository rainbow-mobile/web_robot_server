const {spawn, exec} = require('child_process');

let process = {"test":null,"MAIN_MOBILE":null};
let running = {'test':false,'MAIN_MOBILE':false
};

async function startProcess(filename,path){
    return new Promise((resolve,reject) =>{
        try{
            if(running[filename]){
                resolve({result: "duplicate", message:'process test already running'})
            }else{
                process[filename] = spawn(path);
                process[filename].on('exit', (code) => {
                    console.log(`process[`+filename+`] exited with code ${code}`);
                    running[filename] = false;
                    clearTimeout(timeout);
                    reject({result: "fail", name: filename, message: code})
                });
                process[filename].on('close', (code) => {
                    console.log(`process[`+filename+`] closed with code ${code}`);
                    running[filename] = false;
                    clearTimeout(timeout);
                    reject({result: "fail", name: filename, message: code})
                });
                process[filename].on('error', (code) =>{
                    console.log(`process[`+filename+`] got error with code ${code}`);
                    running[filename] = false;
                    clearTimeout(timeout);
                    reject({result: "fail", name: filename, message: code})
                })
                process[filename].on('spawn', (code) =>{
                    console.log(`process[`+filename+`] spawn with code ${code}`);
                    running[filename] = true;
                })
                
                const timeout = setTimeout(() =>{
                    console.log("success");
                    resolve({result: "success", name: filename});
                },1000);
            }
        }catch(error){
            console.error(`process[`+filename+`] Error : `,error);
            reject({result: "fail", name: filename, message:error});
        }
    });
}
async function chmod(path){
    return new Promise((resolve,reject) =>{
        try{
            const cmd = 'chmod +x '+path;
            const cc = exec(cmd);
            cc.on('close', (code) => {
                console.log("chmod all ");
                resolve();
            });
        }catch(error){
            console.error("Start Process Error : ",error);
            reject({message:'process test all failed'})
        }
    });
}
async function checkBusy(path){
    return new Promise((resolve,reject) =>{
        try{
            const cmd = 'lsof '+path;
            // const cmd = "ifconfig";
            const cc = exec(cmd,(error,stdout,stderr) =>{
                if (error) {
                  console.error(`Error executing lsof:`,error);
                //   reject();
                }
                if (stdout) {
                    console.log(`File is busy. Processes using the file:\n`,stdout);
                    if(stdout == ""){
                        resolve();
                    }else{
                        reject({message:'file is busy'})
                    }
                } else {
                  console.log('File is not busy.');
                  resolve();
                }
            });
        }catch(error){
            console.error("Check Busy Error : ",error);
            reject({message:'process test all failed'})
        }
    });
}
async function stopProcessAll(path){
    return new Promise((resolve,reject) =>{
        try{
            const cmd = 'ps aux | grep '+path+' | awk \'{print $2}\' | xargs kill -9';
            const kill = exec(cmd);
            kill.on('finish', (code) => {
                console.log("stop all ");
                resolve();
            });
        }catch(error){
            console.error("Start Process Error : ",error);
            reject({message:'process test all failed'})
        }
    });
}
async function stopProcess(filename){
    return new Promise((resolve,reject) =>{
        try{
            if(running[filename]){
                console.log("need kill");
                process[filename].on('exit', (code) => {
                    console.log("stop process exit")
                    running[filename] = false;
                    // resolve();
                });
                process[filename].on('close', (code) => {
                    console.log("stop process close")
                    running[filename] = false;
                    resolve();
                });
                process[filename].kill(9);
            }else{
                console.log("no kill")
                resolve();
            }
        }catch(error){
            console.error("Stop process Error : ",error);
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
    restartProcess: restartProcess,
    chmod: chmod,
    checkBusy:checkBusy
}
