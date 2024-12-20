import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entity, Column, PrimaryColumn, CreateDateColumn, Timestamp } from 'typeorm';
import { StateLogEntity } from './entity/state.entity';
import { EntityManager, Repository } from 'typeorm';
import { PowerLogEntity } from './entity/power.entity';
import * as moment from 'moment';
import httpLogger from '@common/logger/http.logger';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';

@Injectable()
export class LogService {
    constructor(
        @InjectRepository(StateLogEntity)
        private readonly stateRepository: Repository<StateLogEntity>,

        @InjectRepository(PowerLogEntity)
        private readonly powerRepository: Repository<PowerLogEntity>,
    ){}

    async getState():Promise<StateLogEntity[]>{
        return this.stateRepository.find();
    }

    async getPower():Promise<PowerLogEntity[]>{
        return this.powerRepository.find();
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
                httpLogger.error(`getStateState Error : ${error}`);
                reject({data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500},status:HttpStatus.INTERNAL_SERVER_ERROR})
            }
        })
    }


    async getPowerLog(key:string){
        return new Promise(async(resolve, reject) => {
            try{
                const data = await this.powerRepository.find();

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
                httpLogger.error(`getPowerLog Error : ${error}`);
                reject({data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500},status:HttpStatus.INTERNAL_SERVER_ERROR})
            }
        })
    }
}
