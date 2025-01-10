import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entity, Column, PrimaryColumn, CreateDateColumn, Timestamp, LessThan } from 'typeorm';
import { StateLogEntity } from './entity/state.entity';
import { Cron } from '@nestjs/schedule';
import { EntityManager, Repository } from 'typeorm';
import { PowerLogEntity } from './entity/power.entity';
import * as moment from 'moment';
import httpLogger from '@common/logger/http.logger';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { defaultStatusPayload, StatusPayload } from '@common/interface/robot/status.interface';
import { Http } from 'winston/lib/winston/transports';
import { DataSource } from 'typeorm';
import { StatusLogEntity } from './entity/status.entity';
import * as Query from '@common/interface/db/query';
import { TaskPayload } from '@common/interface/robot/task.interface';
import * as path from 'path';
import * as fs from 'fs';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { homedir } from 'os';
import * as AdmZip from 'adm-zip';
import { DateUtil } from '@common/util/date.util';
import { LogReadDto } from './dto/log.read.dto';
import { PaginationResponse } from '@common/pagination/pagination.response';
import { errorToJson } from '@common/util/error.util';

@Injectable()
export class LogService {
    constructor(
        @InjectRepository(StateLogEntity)
        private readonly stateRepository: Repository<StateLogEntity>,

        @InjectRepository(PowerLogEntity)
        private readonly powerRepository: Repository<PowerLogEntity>,

        @InjectRepository(StatusLogEntity)
        private readonly statusRepository: Repository<StatusLogEntity>,
        
        private readonly dataSource: DataSource
    ){
      this.checkTables('status',Query.create_status);  
    }

    async getState():Promise<StateLogEntity[]>{
        return this.stateRepository.find();
    }

    async getPower():Promise<PowerLogEntity[]>{
        return this.powerRepository.find();
    }

    async addDisconForGaps(filteredArray:{time:Date, value:any}[]){
      var result = [];
      for (let i = 0; i < filteredArray.length; i++) {
        result.push({
          time: moment(filteredArray[i].time),
          value: filteredArray[i].value,
        });

        if (i < filteredArray.length) {
          const currentEndTime = moment(filteredArray[i].time).valueOf();
          const nextStartTime = (i==filteredArray.length - 1)?moment().valueOf():moment(filteredArray[i + 1].time).valueOf();
          const gap = (nextStartTime - currentEndTime) / 1000; // 간격을 분 단위로 계산

          if (gap > 20) {
            // 20초 이상 공백이 있을 때
            if(typeof filteredArray[i].value == "string"){
                const disconEntry = {
                  time: moment.unix(currentEndTime/1000 + 10),
                  value: "Discon",
                };
                result.push(disconEntry);
            }else if(typeof filteredArray[i].value == "boolean"){
                const disconEntry = {
                  time: moment.unix(currentEndTime/1000 + 10),
                  value: false,
                };
                result.push(disconEntry);
            }else{
                const disconEntry = {
                  time: moment.unix(currentEndTime/1000 + 10),
                  value: 0,
                };
                result.push(disconEntry);
            }
          }
        }
      }

      
      if (result.length > 0) {
          if(typeof result[0].value == "string"){
              const finalEntry = {
                time: moment(),
                value: "Final",
              };
              result.push(finalEntry);
          }else if(typeof result[0].value == "boolean"){
              const finalEntry = {
                time: moment(),
                value: false,
              };
              result.push(finalEntry);
          }else{
              const finalEntry = {
                time: moment(),
                value: 0,
              };
              result.push(finalEntry);
          }
      }
      return result.map((data) => ({time:data.time.format('YYYY-MM-DD hh:mm:ss'),value:data.value}));
    };


    async getStatusParam(key: string){
      return new Promise(async(resolve, reject) => {
          try{
              const data = await this.statusRepository.find();
              var newDataMap;
              if(key.split('/').length > 1){
                newDataMap = data.map((data) => ({ time:data.time, value:data[key.split('/')[0]][key.split('/')[1]] }));
              }else{
                newDataMap = data.map((data) => ({ time:data.time, value:data[key] }));
              }
              const finalArray = await this.addDisconForGaps(newDataMap);
              
              const filteredChanges = finalArray.filter((item, index, arr) => {
                if (index === 0) return true; // 첫 번째 항목은 항상 포함
                return item.value !== arr[index - 1].value;
              });
          
              resolve(filteredChanges);
          }catch(error){
              httpLogger.error(`[LOG] getStateState Error : ${errorToJson(error)}`);
              reject({data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500},status:HttpStatus.INTERNAL_SERVER_ERROR})
          }
      })
    }
    async getStateLog(key: string){
        return new Promise(async(resolve, reject) => {
            try{
                const data = await this.stateRepository.find();
                const addDisconForGaps = (filteredArray:{time:Date, value:any}[]) => {
                    var result = [];
                    for (let i = 0; i < filteredArray.length; i++) {
                      result.push({
                        time: moment(filteredArray[i].time),
                        value: filteredArray[i].value,
                      });

                      if (i < filteredArray.length) {
                        const currentEndTime = moment(filteredArray[i].time).valueOf();
                        const nextStartTime = (i==filteredArray.length - 1)?moment().valueOf():moment(filteredArray[i + 1].time).valueOf();
                        const gap = (nextStartTime - currentEndTime) / 1000; // 간격을 분 단위로 계산
              
                        if (gap > 20) {
                          // 20초 이상 공백이 있을 때
                            if(typeof filteredArray[i].value == "string"){
                                const disconEntry = {
                                  time: moment.unix(currentEndTime/1000 + 10),
                                  value: "Discon",
                                };
                                result.push(disconEntry);
                            }else if(typeof filteredArray[i].value == "boolean"){
                                const disconEntry = {
                                  time: moment.unix(currentEndTime/1000 + 10),
                                  value: false,
                                };
                                result.push(disconEntry);
                            }else{
                                const disconEntry = {
                                  time: moment.unix(currentEndTime/1000 + 10),
                                  value: 0,
                                };
                                result.push(disconEntry);
                            }
                        }
                      }
                    }
    
                    
                    if (result.length > 0) {
                        if(typeof result[0].value == "string"){
                            const finalEntry = {
                            //   time: moment.unix(result[result.length - 1].time.unix() + 10000),
                                time: moment(),
                              value: "Final",
                            };
                            result.push(finalEntry);
                        }else if(typeof result[0].value == "boolean"){
                            const finalEntry = {
                                //   time: moment.unix(result[result.length - 1].time.unix() + 10000),
                                    time: moment(),
                              value: false,
                            };
                            result.push(finalEntry);
                        }else{
                            const finalEntry = {
                                //   time: moment.unix(result[result.length - 1].time.unix() + 10000),
                                    time: moment(),
                              value: 0,
                            };
                            result.push(finalEntry);
                        }
                    }

                    return result.map((data) => ({time:data.time.format('YYYY-MM-DD hh:mm:ss'),value:data.value}));
                  };
              
                  const newDataMap = data.map((data) => ({ time:data.time, value:data[key] }));
                  const finalArray = addDisconForGaps(newDataMap);
                  // 1. 상태가 변경되는 순간만 남기기
                  const filteredChanges = finalArray.filter((item, index, arr) => {
                    if (index === 0) return true; // 첫 번째 항목은 항상 포함
                    return item.value !== arr[index - 1].value;
                  });
              
                  resolve(filteredChanges);
            }catch(error){
                httpLogger.error(`[LOG] getStateState Error : ${errorToJson(error)}`);
                reject({data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500},status:HttpStatus.INTERNAL_SERVER_ERROR})
            }
        })
    }

    async getStatusLog(key:string){
        return new Promise(async(resolve, reject) => {
            try{
                const data = await this.statusRepository.find();

                const calculateGapTime = (prev, next) => {
                  const gap = (next - prev) / 1000; // 간격을 초 단위로 계산
                  return gap;
                };
                const addDisconForGaps = (filteredArray:{time:Date, value:any}[]) => {
                    var result = [];
                    for (let i = 0; i < filteredArray.length; i++) {
                      result.push({
                        time: moment(filteredArray[i].time),
                        value: filteredArray[i].value,
                      });
                      if (i < filteredArray.length - 1) {
                        const currentEndTime = moment(filteredArray[i].time).valueOf();
                        const nextStartTime = moment(filteredArray[i + 1].time).valueOf();
                        const gap = (nextStartTime - currentEndTime) / 1000; // 간격을 분 단위로 계산
              
                        if (gap > 20) {
                            // 20초 이상 공백이 있을 때
                            const disconEntry = {
                              time: moment(currentEndTime/1000 + 10),
                              value: 0,
                            };
                            result.push(disconEntry);
                            const disconEntry2 = {
                              time: moment(nextStartTime/1000 - 10),
                              value: 0,
                            };
                            result.push(disconEntry2);
                        }
                      }
                    }

                    const curTime = moment();
                    if (result.length > 0) {
                        if (calculateGapTime(result[result.length - 1].time, curTime) > 20) {
                          const finalEntry = {
                            time: moment.unix(result[result.length - 1].time.unix() + 10),
                            value: 0,
                          };
                          result.push(finalEntry);
                          const curEntry = {
                            time: curTime,
                            value: 0,
                          };
                          result.push(curEntry);
                        }
                      } else {
                        const finalEntry = {
                          time: moment.unix(curTime.unix() - 60 * 12),
                          value: 0,
                        };
                        result.push(finalEntry);
                        const curEntry = {
                          time: curTime,
                          value: 0,
                        };
                        result.push(curEntry);
                      }
                    
                    if (result.length > 0) {
                      const finalEntry = {
                        time: moment.unix(result[result.length - 1].time.unix() + 10),
                        value: 0,
                      };
                      result.push(finalEntry);
                    }

                    return result.map((data) => ({time:data.time.format('YYYY-MM-DD hh:mm:ss'),value:data.value}));
                  };
              
                  const newDataMap = data.map((data) => ({ time:data.time, value:data[key] }));
                  const finalArray = addDisconForGaps(newDataMap);
                  resolve(finalArray);
            }catch(error){
                httpLogger.error(`[LOG] getStatusLog Error : ${errorToJson(error)}`);
                reject({data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500},status:HttpStatus.INTERNAL_SERVER_ERROR})
            }
        })
    }

    async getLogs(type:string, param: LogReadDto):Promise<PaginationResponse<any>>{
      try{
        const logPath = homedir()+"/log/"+type;
        let logdata:any[] = [];
        let dt = new Date(param.startDt);
        const dateEnd = new Date(param.endDt);
        while(dt<=dateEnd){
          const filePath = logPath + "/" + DateUtil.formatDateYYYYMMDD(dt) + ".log" ;
          if(fs.existsSync(filePath)){
            const data = fs.readFileSync(filePath,'utf-8');
            const lines = data.split('\n').filter(line => line.trim() !== "");

            // 로그 라인을 파싱
            const parsedLogs = lines.map(line => {
              const logRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)](?: \[(\w+)\])? (.+)$/;
              const match = line.match(logRegex);

              if (match) {
                  const [, time, level, category, text] = match;
                  if(param.levels){
                    if(!param.levels.includes(level))
                      return null;
                  }

                  if(param.searchType == "category"){
                    if(param.searchText != ""){
                      
                      if(!category||!category.includes(param.searchText)){
                        return null;
                      }
                    }
                  }else if(param.searchType == "log"){
                    if(param.searchText != ""){
                      if(!text.includes(param.searchText)){
                        return null;
                      }
                    }
                  }else if(param.searchType == "time"){
                    if(param.searchText != ""){
                      if(!time.includes(param.searchText)){
                        return null;
                      }
                    }
                  }
                  return { time, level, category:category?category:'', text };
              }
              return null; // 일치하지 않는 라인은 무시
            }).filter(log => log !== null) as Array<{ 
                time: string; 
                level: string; 
                category: string; 
                text: string; 
            }>;

            logdata.push(...parsedLogs);
          }else{
            httpLogger.debug(`[LOG] getLogs File not found: ${filePath}`)
          }
          dt.setDate(dt.getDate()+1);
        }


        if(param.sortOption == "recent"){
          logdata.sort((a,b)=>new Date(b.time).getTime() - new Date(a.time).getTime());
        }


        const count = logdata.length;
        const logs = logdata
          .slice(param.getOffset(),param.getLimit()+param.getOffset());

        return new PaginationResponse(count, param.getLimit(), logs);
        
      }catch(error){
        httpLogger.error(`[LOG] getLogs Error : ${errorToJson(error)}`)
      }
    }


    async getStatus(param: LogReadDto):Promise<PaginationResponse<any>>{
      try{
        const queryBuilder = this.statusRepository
        .createQueryBuilder();
  
        const dateStart = new Date(param.startDt);
        const dateEnd = new Date(param.endDt);
  
        dateStart.setHours(0,0,0,0);
        dateEnd.setHours(23,59,59,999);

        if (param.startDt) {
          queryBuilder.andWhere('time >= :startDt', {
            startDt: dateStart,
          });
        }
    
        if (param.endDt) {
          queryBuilder.andWhere('time <= :endDt', {
            endDt: dateEnd,
          });
        }
    
        const logs = await queryBuilder
          .skip(param.getOffset())
          .take(param.getLimit())
          .getMany();
          
        const count = await queryBuilder.getCount();

        const sanitizeLogs = logs.map((log) => ({...log, time:DateUtil.formatDateYYYYMMbDDsHHcMIcSSZZZ(log.time)}));
          
        return new PaginationResponse(count, param.getLimit(), sanitizeLogs);
      }catch(error){
        httpLogger.error(`[LOG] getStatus Error : ${errorToJson(error)}`)
      }
    }


    async readState(state:StatusPayload) {
      if (state.state.charge == undefined) {
        httpLogger.debug(`[LOG] readState undefined: ${JSON.stringify(state)}`)
      }
      if (state.state.charge != "none" && state.state.dock == "true") {
        return "Charging";
      } else {
        if (state.state.power == "false") {
          return "Power Off";
        } else if (parseFloat(state.condition.mapping_ratio) > 1) {
          return "Mapping";
        } else {
          if (
            state.state.map == "" ||
            state.state.localization != "good" ||
            state.motor[0].status != "1" ||
            state.motor[1].status != "1"
          ) {
            return "Not Ready";
          } else if (state.condition.obs_state != "none") {
            return "Obstacle";
          } else if (state.condition.auto_state == "move") {
            return "Moving";
          } else if (state.condition.auto_state == "pause") {
            return "Paused";
          } else if (state.condition.auto_state == "stop") {
            return "Ready";
          } else {
            return "?";
          }
        }
      }
    }

    // 12시간 지난 데이터를 삭제
    @Cron('0 * * * * *') // 매 분마다 실행
    async deleteOldData(): Promise<void> {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      await this.stateRepository.delete({ time: LessThan(twelveHoursAgo) });
      await this.powerRepository.delete({ time: LessThan(twelveHoursAgo) });
    }
      
    @Cron('0 0 */12 * * *') // 매 12시간마다 실행
    async handleArchiving() {
      httpLogger.info('[LOG] Starting data archiving process...');
      await this.archiveOldDataDay();
      await this.optimizeTable('status');
      httpLogger.info('[LOG] Data archiving and optimization completed.');
    }

    async emitState(state:StatusPayload){
      return new Promise(async(resolve, reject) => {
        try {      
          const newLog:StateLogEntity = {
            time:new Date(),
            state:await this.readState(state),
            auto_state: state.condition.auto_state,
            localization: state.state.localization,
            obs_state: state.condition.obs_state,
            charging: state.state.charge,
            power: state.state.power=="true"?true:false,
            emo: state.state.emo=="true"?true:false,
            dock: state.state.dock=="true"?true:false,
            inlier_error: parseFloat(state.condition.inlier_error),
            inlier_ratio: parseFloat(state.condition.inlier_ratio)
          }
          await this.stateRepository.save(newLog);
          resolve(newLog);
        } catch (error) {
          httpLogger.error(`[LOG] emitState: ${errorToJson(error)}`)
          reject({data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500},status:HttpStatus.INTERNAL_SERVER_ERROR});
        }
      });
    }

    async emitPower(state:StatusPayload){
      return new Promise(async(resolve, reject) => {
        try {      
          const newLog:PowerLogEntity = {
            time:new Date(),
            battery_in:parseFloat(state.power.bat_in),
            battery_out:parseFloat(state.power.bat_out),
            battery_current:parseFloat(state.power.bat_current),
            power:parseFloat(state.power.power),
            total_power:parseFloat(state.power.total_power),
            motor0_status:parseInt(state.motor[0].status),
            motor0_temp:parseFloat(state.motor[0].temp),
            motor0_current:parseFloat(state.motor[0].current),
            motor1_status:parseInt(state.motor[1].status),
            motor1_temp:parseFloat(state.motor[1].temp),
            motor1_current:parseFloat(state.motor[1].current),
            charge_current: parseFloat(state.power.charge_current?state.power.charge_current:'0'),
            contact_voltage: parseFloat(state.power.contact_voltage?state.power.contact_voltage:'0')
          }
          await this.powerRepository.save(newLog);
          resolve(newLog);
        } catch (error) {
          httpLogger.error(`[LOG] emitPower: ${errorToJson(error)}`)
          reject({data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500},status:HttpStatus.INTERNAL_SERVER_ERROR});
        }
      });
    }

    async emitStatusTest(time:string){
      return new Promise(async(resolve, reject) => {
        try{
          const state = defaultStatusPayload;
          httpLogger.debug(`[LOG] emitStatusTest: ${new Date(time)}, ${time}`)
          const newLog:StatusLogEntity = {
            time:new Date(time),
            slam:false,
            type:state.setting.platform_type,
            conditions:{
              state:await this.readState(state),
              auto_state:state.condition.auto_state,
              obs_state:state.condition.obs_state,
              inlier_ratio:parseFloat(state.condition.inlier_ratio),
              inlier_error:parseFloat(state.condition.inlier_error)
            },
            state:{
              charge:state.state.charge,
              dock:state.state.dock,
              localization:state.state.localization,
              map:state.state.map,
              power:state.state.power=="true"?true:false
            },
            task:{
              connection:false,
              file:'',
              id:0,
              running:false
            },
            imu:{
              acc_x:parseFloat(state.imu.acc_x),
              acc_y:parseFloat(state.imu.acc_y),
              acc_z:parseFloat(state.imu.acc_z),
              gyr_x:parseFloat(state.imu.gyr_y),
              gyr_y:parseFloat(state.imu.gyr_y),
              gyr_z:parseFloat(state.imu.gyr_y),
              imu_rx:parseFloat(state.imu.imu_rx),
              imu_ry:parseFloat(state.imu.imu_ry),
              imu_rz:parseFloat(state.imu.imu_rz),
            },
            motor0:{
              connection:state.motor[0].connection=="true"?true:false,
              status:parseInt(state.motor[0].status),
              current:parseFloat(state.motor[0].current),
              temp:parseFloat(state.motor[0].temp)
            },
            motor1:{
              connection:state.motor[1].connection=="true"?true:false,
              status:parseInt(state.motor[1].status),
              current:parseFloat(state.motor[1].current),
              temp:parseFloat(state.motor[1].temp)
            },
            power:{
              bat_current:parseFloat(state.power.bat_current),
              bat_in:parseFloat(state.power.bat_in),
              bat_out:parseFloat(state.power.bat_out),
              power:parseFloat(state.power.power),
              total_power:parseFloat(state.power.total_power),
              charge_current:parseFloat(state.power.charge_current),
              contact_voltage:parseFloat(state.power.contact_voltage),
            },
            pose:{
              x:parseFloat(state.pose.x),
              y:parseFloat(state.pose.y),
              rz:parseFloat(state.pose.rz),
              vx:parseFloat(state.vel.vx),
              vy:parseFloat(state.vel.vy),
              wz:parseFloat(state.vel.wz),
            }
          }
          await this.statusRepository.save(newLog);
          resolve(newLog);
        }catch(error){
          httpLogger.error(`[LOG] emitStatus: ${errorToJson(error)}`)
          reject({data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500},status:HttpStatus.INTERNAL_SERVER_ERROR});
        }
      });
    }

    async emitStatus(state:StatusPayload, slam:boolean, task:TaskPayload){
      return new Promise(async(resolve, reject) => {
        try{
          const newLog:StatusLogEntity = {
            time:new Date(),
            slam:slam,
            type:state.setting.platform_type,
            conditions:{
              state:await this.readState(state),
              auto_state:state.condition.auto_state,
              obs_state:state.condition.obs_state,
              inlier_ratio:parseFloat(state.condition.inlier_ratio),
              inlier_error:parseFloat(state.condition.inlier_error)
            },
            state:{
              charge:state.state.charge,
              dock:state.state.dock,
              localization:state.state.localization,
              map:state.state.map,
              power:state.state.power=="true"?true:false
            },
            task:{
              connection:task.connection,
              file:task.file,
              id:task.id,
              running:task.running
            },
            imu:{
              acc_x:parseFloat(state.imu.acc_x),
              acc_y:parseFloat(state.imu.acc_y),
              acc_z:parseFloat(state.imu.acc_z),
              gyr_x:parseFloat(state.imu.gyr_y),
              gyr_y:parseFloat(state.imu.gyr_y),
              gyr_z:parseFloat(state.imu.gyr_y),
              imu_rx:parseFloat(state.imu.imu_rx),
              imu_ry:parseFloat(state.imu.imu_ry),
              imu_rz:parseFloat(state.imu.imu_rz),
            },
            motor0:{
              connection:state.motor[0].connection=="true"?true:false,
              status:parseInt(state.motor[0].status),
              current:parseFloat(state.motor[0].current),
              temp:parseFloat(state.motor[0].temp)
            },
            motor1:{
              connection:state.motor[1].connection=="true"?true:false,
              status:parseInt(state.motor[1].status),
              current:parseFloat(state.motor[1].current),
              temp:parseFloat(state.motor[1].temp)
            },
            power:{
              bat_current:parseFloat(state.power.bat_current),
              bat_in:parseFloat(state.power.bat_in),
              bat_out:parseFloat(state.power.bat_out),
              power:parseFloat(state.power.power),
              total_power:parseFloat(state.power.total_power),
              charge_current:parseFloat(state.power.charge_current),
              contact_voltage:parseFloat(state.power.contact_voltage),
            },
            pose:{
              x:parseFloat(state.pose.x),
              y:parseFloat(state.pose.y),
              rz:parseFloat(state.pose.rz),
              vx:parseFloat(state.vel.vx),
              vy:parseFloat(state.vel.vy),
              wz:parseFloat(state.vel.wz),
            }
          }
          await this.statusRepository.save(newLog);
          resolve(newLog);
        }catch(error){
          httpLogger.error(`[LOG] emitStatus: ${errorToJson(error)}`)
          reject({data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500},status:HttpStatus.INTERNAL_SERVER_ERROR});
        }
      });
    }

    async checkTables(name:string, query:string) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      try{
        await queryRunner.startTransaction();
        // 테이블 존재 여부 확인
        const [rows] = await queryRunner.query(`
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = '${name}'
          `);
      
        const tableExists = rows["COUNT(*)"] > 0;
      
        if (!tableExists) {
          httpLogger.info(`[LOG] checkTable: Table "${name}" does not exist. Creating...`);
          await queryRunner.query(query);
          httpLogger.info(`[LOG] checkTable: Table "${name}" created successfully.`);
        }
      }catch(error){
        httpLogger.error(`[LOG] checkTable: ${errorToJson(error)}`)
      }
    }


    async archiveOldDataDay(): Promise<void> {
      //오래전 ~ 1일 전 데이터를 모두 각각 파일 이름으로 저장
      const startDt = await this.getOldestTime();
      httpLogger.debug(`[LOG] archiveOldDataDay: startDt(${startDt})`)
      let dt = startDt;
      const endDt = new Date();
      endDt.setDate(endDt.getDate() - 60);
      endDt.setHours(0,0,0,0);

      while(dt < endDt){
        await this.archiveOldDBData(DateUtil.formatDateYYYYMMDD(dt));
        await this.archiveOldJSONData('socket',DateUtil.formatDateYYYYMMDD(dt));
        await this.archiveOldJSONData('http',DateUtil.formatDateYYYYMMDD(dt));
        dt.setDate(dt.getDate() + 1);
        httpLogger.debug(`[LOG] archiveOldDataDay: nextDt(${dt}), endDt(${endDt})`)
      }

      httpLogger.debug(`[LOG] archiveOldDataDay: Done`)
      return;     
    }

    async  getOldestTime() {
      const oldestRecord = await this.statusRepository
        .createQueryBuilder('entity')
        .select('entity.time')
        .orderBy('entity.time', 'ASC') // ASC 정렬로 가장 오래된 항목을 맨 위로
        .getOne(); // 가장 첫 번째 항목 가져오기

      return oldestRecord?.time || null; // 시간이 없으면 null 반환
    }

    async archiveOldDBData(date:string): Promise<void> {
      const dateStart = new Date(date);
      const dateEnd = new Date(date);

      dateStart.setHours(0,0,0,0);
      dateEnd.setHours(23,59,59,999);

      // 오래된 데이터 가져오기
      const oldData = await this.statusRepository
        .createQueryBuilder()
        .where('time >= :dateStart && time <= :dateEnd', { dateStart,dateEnd })
        .getMany();

      const oldData_time = oldData.map((data)=>({...data,time:DateUtil.formatDateYYYYMMbDDsHHcMIcSSZZZ(data.time)}));
      
      if (oldData.length > 0) {
        // 파일 저장 경로 설정
        const archiveDir = path.join(homedir(),'log','archive','status');
        if (!fs.existsSync(archiveDir)) {
          fs.mkdirSync(archiveDir,{recursive:true});
        }
        
        const fileName = `${moment(date).format('YYYY-MM-DD')}`;
        const filePath = path.join(archiveDir, fileName);
        let jsonData: any[] = [];
        if(fs.existsSync(filePath)){
          const fileContent = fs.readFileSync(filePath, 'utf-8');        
          jsonData = JSON.parse(fileContent);
          if(!Array.isArray(jsonData)){
            jsonData = [];
          }
        }

        jsonData.push(oldData_time);

        // 데이터를 JSON 파일로 저장
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
  
        //파일을 압축
        const zip = new AdmZip();
        zip.addLocalFile(filePath);
        zip.writeZip(filePath+".archive");

        fs.unlink(filePath,(err)=>{
          if(err){
            httpLogger.error(`[LOG] ArchiveOldDBData File Unlink : ${filePath}, ${errorToJson(err)}`);
          }
        });

        // Original 테이블에서 데이터 삭제
        await this.statusRepository
          .createQueryBuilder()
          .delete()
          .where('time >= :dateStart && time <= :dateEnd', { dateStart,dateEnd })
          .execute();
  
        httpLogger.info(`[LOG] ArchiveOldDBData: Archived data saved to ${filePath}`);
      } else {
        httpLogger.info(`[LOG] ArchiveOldDBData: No data to archive`);
      }
    }

    async archiveOldJSONData(type:string, date:string): Promise<void> {
      //파일 존재 확인
      const filePath = homedir() + "/log/"+type+"/"+date+".log";
      if(fs.existsSync(filePath)){

        //파일을 압축
        const zipPath = path.join(homedir(),'log','archive',type,date+".archive");

        const zip = new AdmZip();
        zip.addLocalFile(filePath);
        zip.writeZip(zipPath);

        fs.unlink(filePath,(err)=>{
          if(err){
            httpLogger.error(`[LOG] archiveOldJSONData: Archive unlink Error : ${errorToJson(err)}`);
          }
        });

        httpLogger.info(`[LOG] archiveOldJSONData: Archived Done ${filePath} -> ${zipPath}`);

      }else{
        httpLogger.debug(`[LOG] archiveOldJSONData: ${date} Log file not found`);
      }
    }


    async optimizeTable(tableName: string) {
      try {
        // 테이블 최적화
        await this.dataSource.query(`OPTIMIZE TABLE ${tableName}`);
        httpLogger.info(`[LOG] optimizeTable: Table ${tableName} optimized successfully`);
      } catch (error) {
        httpLogger.error(`[LOG] optimizeTable: optimizing table ${tableName}, ${errorToJson(error)}`);
        throw error;
      }
    }
}
