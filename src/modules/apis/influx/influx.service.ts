import { Injectable } from '@nestjs/common';
import { InfluxDBClient, Point } from '@influxdata/influxdb3-client';
import * as dotenv from 'dotenv';
import httpLogger from '@common/logger/http.logger';
import { errorToJson } from '@common/util/error.util';
import { StatusPayload } from '@common/interface/robot/status.interface';

dotenv.config();

@Injectable()
export class InfluxDBService {
  private client: InfluxDBClient;
  private writeApi;
  private queryApi;
  private bucket: string;
  private org: string;
  private database = "status";

  constructor() {
    const host = "http://127.0.0.1:8181";
    const token = '';
    this.bucket = process.env.INFLUX_BUCKET;
    this.org = process.env.INFLUX_ORG;

    this.client = new InfluxDBClient({ host, token });
  }

  // 데이터 InfluxDB에 저장
  async writeData() {
    const point = Point.measurement('home').setTag('room','Rainbow').setFloatField('temp','22.2').setTimestamp(new Date());
    try {
      const result = await this.client.write([point], this.database, '', { precision: 'ms' });
      console.log(result);
      console.log('Data has been written successfully!');
    } catch (error) {
      console.error(`Error writing data to InfluxDB: ${error.body}`);
    }
  }

  async testStatus(time:string){
    try{
      const batteryPoint = Point.measurement('battery')
      .setTag('type','SIMUL')
      .setFloatField('battery_in',0)
      .setFloatField('battery_out',0)
      .setFloatField('battery_current',0)
      .setFloatField('battery_percent',0)
      // .setTimestamp(time);

      const result = await this.client.write([batteryPoint], this.database, '', { precision: 'ns' });
      console.log(`Test ${time} Data has been written successfully!`);
    }catch(error){
      httpLogger.error(`[INFLUX] writeStatus : ${errorToJson(error)}`)
    }
  }

  async writeMoveStatus(status:StatusPayload){
    try{
      const type = "SIMUL";
      const posePoint = Point.measurement('pose')
      .setTag('type',type)
      .setFloatField('x',parseFloat(status.pose.x))
      .setFloatField('y',parseFloat(status.pose.y))
      .setFloatField('rz',parseFloat(status.pose.rz))
      .setFloatField('vx',parseFloat(status.vel.vx))
      .setFloatField('vy',parseFloat(status.vel.vy))
      .setFloatField('wz',parseFloat(status.vel.wz))
      
      const moveStatePoint = Point.measurement('move_state')
      .setTag('type',type)
      .setStringField('auto_move',status.move_state.auto_move)
      .setStringField('jog_move',status.move_state.jog_move)
      .setStringField('dock_move',status.move_state.dock_move)
      .setStringField('obs',status.move_state.obs)
      .setStringField('path',status.move_state.path)

      const goalPoint = Point.measurement('goal_node')
      .setTag('type',type)
      .setStringField('id',status.goal_node.id)
      .setStringField('name',status.goal_node.name)
      .setStringField('state',status.goal_node.state)
      .setFloatField('x',parseFloat(status.goal_node.x))
      .setFloatField('y',parseFloat(status.goal_node.y))
      .setFloatField('rz',parseFloat(status.goal_node.rz))

      const curPoint = Point.measurement('cur_node')
      .setTag('type',type)
      .setStringField('id',status.cur_node.id)
      .setStringField('name',status.cur_node.name)
      .setFloatField('x',parseFloat(status.cur_node.x))
      .setFloatField('y',parseFloat(status.cur_node.y))
      .setFloatField('rz',parseFloat(status.cur_node.rz))

      const result = await this.client.write([posePoint,moveStatePoint,goalPoint,curPoint], this.database, '', { precision: 'ns' });
      // console.log('Data has been written successfully!');
    }catch(error){
      httpLogger.error(`[INFLUX] writeStatus : ${errorToJson(error)}`)
    }
  }
  async writeStatus(status:StatusPayload){
    try{
      const type = "SIMUL";
      const batteryPoint = Point.measurement('battery')
      .setTag('type',type)
      .setFloatField('battery_in',parseFloat(status.power.bat_in))
      .setFloatField('battery_out',parseFloat(status.power.bat_out))
      .setFloatField('battery_current',parseFloat(status.power.bat_current))
      .setFloatField('battery_percent',parseFloat(status.power.bat_percent))
      const powerPoint = Point.measurement('power')
      .setTag('type',type)
      .setFloatField('power',parseFloat(status.power.power))
      .setFloatField('total_power',parseFloat(status.power.total_power))
      .setFloatField('charge_current',parseFloat(status.power.charge_current))
      .setFloatField('contact_voltage',parseFloat(status.power.contact_voltage))
      const conditionPoint = Point.measurement('condition')
      .setTag('type',type)
      .setFloatField('inlier_ratio',parseFloat(status.condition.inlier_ratio))
      .setFloatField('inlier_error',parseFloat(status.condition.inlier_error))
      .setFloatField('mapping_ratio',parseFloat(status.condition.mapping_ratio))
      .setFloatField('mapping_error',parseFloat(status.condition.mapping_error))
      const imuPoint = Point.measurement('imu')
      .setTag('type',type)
      .setFloatField('imu_rx',parseFloat(status.imu.imu_rx))
      .setFloatField('imu_ry',parseFloat(status.imu.imu_ry))
      .setFloatField('imu_rz',parseFloat(status.imu.imu_rz))
      .setFloatField('gyr_x',parseFloat(status.imu.gyr_x))
      .setFloatField('gyr_y',parseFloat(status.imu.gyr_y))
      .setFloatField('gyr_z',parseFloat(status.imu.gyr_z))
      .setFloatField('acc_x',parseFloat(status.imu.acc_x))
      .setFloatField('acc_y',parseFloat(status.imu.acc_y))
      .setFloatField('acc_z',parseFloat(status.imu.acc_z))

      const statePoint = Point.measurement('robot_state')
      .setTag('type',type)
      .setStringField('charge',status.robot_state.charge)
      .setStringField('localization',status.robot_state.localization)
      .setStringField('dock',status.robot_state.dock)
      .setStringField('emo',status.robot_state.emo)
      .setStringField('power',status.robot_state.power)
      .setStringField('map_name',status.map.map_name)
      .setStringField('map_status',status.map.map_status)
      const motorLeftPoint = Point.measurement('motor_left')
      .setTag('type',type)
      .setStringField('connection',status.motor[1].connection)
      .setFloatField('current',parseFloat(status.motor[1].current))
      .setIntegerField('status',parseInt(status.motor[1].status))
      .setFloatField('temperature',parseFloat(status.motor[1].temp))
      const motorRightPoint = Point.measurement('motor_right')
      .setTag('type',type)
      .setStringField('connection',status.motor[0].connection)
      .setFloatField('current',parseFloat(status.motor[0].current))
      .setIntegerField('status',parseInt(status.motor[0].status))
      .setFloatField('temperature',parseFloat(status.motor[0].temp))


      const result = await this.client.write([batteryPoint,powerPoint,conditionPoint,imuPoint,statePoint,motorLeftPoint,motorRightPoint], this.database, '', { precision: 'ns' });
      // console.log('Data has been written successfully!');
    }catch(error){
      httpLogger.error(`[INFLUX] writeStatus : ${errorToJson(error)}`)
    }
  }
  
  async queryData(database:string, table:string){
    return new Promise(async(resolve, reject) => {
      try{
        const result = this.client.queryPoints(`SELECT * FROM ${table}`,database);
        const array = [];
        for await (const point of result) {
          array.push(point);
        }
        console.log(array);
        resolve(array);
      }catch(error){
        httpLogger.error(`[INFLUX] queryData : ${errorToJson(error)}`);
        console.error(error);
        reject();
      }
    })
  }
}

  // // InfluxDB에서 데이터 조회
  // async queryData(sensor: string) {
  //   const fluxQuery = `
  //     from(bucket: "${this.bucket}")
  //     |> range(start: -1h)
  //     |> filter(fn: (r) => r._measurement == "battery" and r.sensor == "${sensor}")
  //   `;
  //   return new Promise((resolve, reject) => {
  //     const results: any[] = [];
  //     this.queryApi.queryRows(fluxQuery, {
  //       next(row, tableMeta) {
  //         results.push(tableMeta.toObject(row));
  //       },
  //       error(error) {
  //         reject(error);
  //       },
  //       complete() {
  //         resolve(results);
  //       },
  //     });
  //   });
  // }

// }
