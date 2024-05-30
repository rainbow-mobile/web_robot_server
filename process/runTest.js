const {spawn, exec} = require('child_process');

let process_test = null;

function startTest(path){
    return new Promise((resolve,reject) =>{
        try{
            if(process_test){
                console.log("processtest running")
                reject({message:'process test already running'})
            }else{
                process_test = spawn(path);
                process_test.on('exit', (code) => {
                    console.log(`process_test exited with code ${code}`);
                    process_test = null;
                });
                process_test.on('close', (code) => {
                    console.log(`process_test closed with code ${code}`);
                    process_test = null;
                });
                resolve();
            }
        }catch(error){
            console.error("Start Process Error : ",error);
            reject({message:'process test run failed'})
        }
    });
}
function stopTestAll(path){
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
async function stopTest(){
    return new Promise((resolve,reject) =>{
        try{
            if(process_test){
                process_test.on('exit', (code) => {
                    process_test = null;
                    resolve();
                });
                process_test.on('close', (code) => {
                    process_test = null;
                    resolve();
                });
                process_test.kill(9);
            }else{
                console.log("no kill")
                resolve();
            }
        }catch(error){
            console.error("Start Process Error : ",error);
            reject();
        }
    });
}

async function restartTest(path){
    return new Promise((resolve,reject) =>{
        try{
            stopTest().then(()=>{
                startTest(path).then(() =>{
                    resolve();
                }).catch((err) =>{
                    console.error(err);
                    reject({message:'process test run failed'})
                })  
            }).catch((err) =>{
                console.error(err);
                reject();
            })
        }catch(error){
            console.error("Start Process Error : ",error);
            reject({message:'process test run failed'})
        }
    });
}

module.exports = {
    startTest: startTest,
    stopTest: stopTest,
    stopTestAll: stopTestAll,
    restartTest: restartTest
}
