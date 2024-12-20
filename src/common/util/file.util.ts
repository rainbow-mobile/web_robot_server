import * as fs from 'fs';
import { HttpStatus } from '@nestjs/common';
import httpLogger from '@common/logger/http.logger';
import * as csv from 'csv';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';

export async function readJson(dir:string){
    return new Promise(async(resolve,reject) => {
        try{
            console.log(dir);
            fs.open(dir, "r", (err,fd) => {
                if(err){
                    console.log("readJson file open err");
                    reject({status:HttpStatus.NOT_FOUND, data:{message:HttpStatusMessagesConstants.FILE.NOT_FOUND_404}});
                }else{
                    const filecontent = fs.readFileSync(dir, "utf-8");
                    const jsonData = JSON.parse(filecontent);
                    resolve(jsonData);
                }
            })
        }catch(error){
            httpLogger.error('readJson Error : ', error);
            reject({status:HttpStatus.INTERNAL_SERVER_ERROR, data:{message:HttpStatusMessagesConstants.FILE.FAIL_READ_500}});
        }
    })

}

export async function deleteFile(dir:string){
    return new Promise(async(resolve,reject) => {
        try{
            console.log(dir);
            fs.open(dir, "r", (err,fd) => {
                if(err){
                    httpLogger.error("deleteFile Error : Open Failed");
                    reject({status:HttpStatus.NOT_FOUND, data:{message:HttpStatusMessagesConstants.FILE.NOT_FOUND_404}});
                }else{
                    fs.unlink(dir, (err) => {
                        if(err){
                            httpLogger.error("deleteFile Error : Unlink Failed ");
                            reject({status:HttpStatus.INTERNAL_SERVER_ERROR, data:{message:HttpStatusMessagesConstants.FILE.FAIL_DELETE_500}})
                        }
                        resolve({message:HttpStatusMessagesConstants.FILE.SUCCESS_DELETE_200});
        
                    })
                }
            })
        }catch(error){
            httpLogger.error('deleteFile Error : ', error);
            reject({status:HttpStatus.INTERNAL_SERVER_ERROR, data:{message:error}});
        }
    })
}

export async function saveJson(dir:string, data:any){
    return new Promise(async(resolve,reject) => {
        try{
            console.log(dir);

            // JSON 데이터를 파일로 저장
            fs.writeFileSync(dir, JSON.stringify(data, null, 2));
            resolve({message:HttpStatusMessagesConstants.FILE.SUCCESS_WRITE_201,data:data});
        }catch(error){
            httpLogger.error("saveJson Error : ", error);
            reject({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              data: {message:HttpStatusMessagesConstants.FILE.FAIL_WRITE_500},
            });
          }
    })
}

export async function readCsv(dir:string){
    return new Promise(async(resolve,reject) => {
        try{
            console.log(dir);
            fs.open(dir, "r", (err,fd) => {
                if(err){
                    reject({status:HttpStatus.NOT_FOUND, data:{message:HttpStatusMessagesConstants.FILE.NOT_FOUND_404}});
                }else{
                    const results = [];
                    fs.createReadStream(dir)
                      .pipe(csv.parse({skip_empty_lines:true,skip_records_with_error:true}))
                      .on("data", (data) => {console.log(data);results.push(data)})
                      .on("error",(error) => {
                        console.error(error);
                        
                        reject({status:HttpStatus.INTERNAL_SERVER_ERROR, data:{message:HttpStatusMessagesConstants.FILE.FAIL_READ_500}})
                    })
                      .on("end", () => {
                        console.log("END");
                        resolve(results);
                      });
                }
            })
        }catch(error){
            httpLogger.error('readCsv Error : ', error);
            reject({status:HttpStatus.INTERNAL_SERVER_ERROR, data:{message:HttpStatusMessagesConstants.FILE.FAIL_READ_500}});
        }
    })
}

export async function saveCsv(dir:string,data:any[]){
    return new Promise(async(resolve,reject) => {
        try{
            console.log(dir);
            const csvData = data.map((row) => row.join(",")).join("\n");
            // JSON 데이터를 파일로 저장
            fs.writeFile(dir, csvData, (err) => {
              if (err) {
                httpLogger.error("Save CSV Error : ", err);
                reject({
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  message: HttpStatusMessagesConstants.FILE.FAIL_WRITE_500,
                });
              }
              resolve({
                message:HttpStatusMessagesConstants.FILE.SUCCESS_WRITE_201
              });
            });
        }catch(error){
            httpLogger.error('saveCsv Error : ', error);
            reject({status:HttpStatus.INTERNAL_SERVER_ERROR, data:{message:HttpStatusMessagesConstants.FILE.FAIL_WRITE_500}});
        }
    })
}