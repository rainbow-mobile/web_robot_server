import { Injectable } from '@nestjs/common';
import { InfluxDBClient, Point } from '@influxdata/influxdb3-client';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class InfluxDBService {
  private client: InfluxDBClient;
  private writeApi;
  private queryApi;
  private bucket: string;
  private org: string;
  private database = "sensors";

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
      await this.client.write([point], this.database, '', { precision: 's' });
      console.log('Data has been written successfully!');
    } catch (error) {
      console.error(`Error writing data to InfluxDB: ${error.body}`);
    }
  }
  
  async queryData(){
    const result = await this.client.query('SELECT * FROM home','sensors');
    console.log(result);
    return result;
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
