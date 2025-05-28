import * as fs from 'fs';
import { HttpStatus } from '@nestjs/common';
import httpLogger from '@common/logger/http.logger';
import * as csv from 'csv';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { errorToJson } from './error.util';

export async function readJson(dir: string) {
  return new Promise<any[]>(async (resolve, reject) => {
    try {
      fs.open(dir, 'r', (err, fd) => {
        if (err) {
          httpLogger.error(`[FILE] readJson: ${dir}, ${errorToJson(err)}`);
          reject({
            status: HttpStatus.NOT_FOUND,
            data: { message: HttpStatusMessagesConstants.FILE.NOT_FOUND_404 },
          });
        } else {
          const filecontent = fs.readFileSync(dir, 'utf-8');
          const jsonData = JSON.parse(filecontent);
          resolve(jsonData);
        }
      });
    } catch (error) {
      httpLogger.error(`[FILE] readJson: ${dir}, ${errorToJson(error)}`);
      reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: { message: HttpStatusMessagesConstants.FILE.FAIL_READ_500 },
      });
    }
  });
}

export async function deleteFile(dir: string) {
  return new Promise(async (resolve, reject) => {
    try {
      fs.open(dir, 'r', (err, fd) => {
        if (err) {
          httpLogger.error(`[FILE] deleteFile: ${dir}, ${errorToJson(err)}`);
          reject({
            status: HttpStatus.NOT_FOUND,
            data: { message: HttpStatusMessagesConstants.FILE.NOT_FOUND_404 },
          });
        } else {
          fs.unlink(dir, (err) => {
            if (err) {
              httpLogger.error(
                `[FILE] deleteFile: ${dir}, ${errorToJson(err)}`,
              );
              reject({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                data: {
                  message: HttpStatusMessagesConstants.FILE.FAIL_DELETE_500,
                },
              });
            }
            resolve({
              message: HttpStatusMessagesConstants.FILE.SUCCESS_DELETE_200,
            });
          });
        }
      });
    } catch (error) {
      httpLogger.error(`[FILE] deleteFile: ${dir}, ${errorToJson(error)}`);
      reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: { message: error },
      });
    }
  });
}

export async function saveJson(dir: string, data: any) {
  return new Promise(async (resolve, reject) => {
    try {
      // JSON 데이터를 파일로 저장
      fs.writeFileSync(dir, JSON.stringify(data, null, 2));
      httpLogger.info(`[FILE] saveJson: ${dir}, ${JSON.stringify(data)}`);
      resolve({
        message: HttpStatusMessagesConstants.FILE.SUCCESS_WRITE_201,
        data: data,
      });
    } catch (error) {
      httpLogger.error(`[FILE] saveJson: ${dir}, ${errorToJson(error)}`);
      reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: { message: HttpStatusMessagesConstants.FILE.FAIL_WRITE_500 },
      });
    }
  });
}

export async function readCsv(dir: string) {
  return new Promise(async (resolve, reject) => {
    try {
      fs.open(dir, 'r', (err, fd) => {
        if (err) {
          httpLogger.error(`[FILE] readCSV: ${dir}, ${errorToJson(err)}`);
          reject({
            status: HttpStatus.NOT_FOUND,
            data: { message: HttpStatusMessagesConstants.FILE.NOT_FOUND_404 },
          });
        } else {
          const results = [];
          fs.createReadStream(dir)
            .pipe(
              csv.parse({
                skip_empty_lines: true,
                skip_records_with_error: true,
              }),
            )
            .on('data', (data) => {
              results.push(data);
            })
            .on('error', (error) => {
              httpLogger.error(`[FILE] readCSV: ${dir}, ${errorToJson(error)}`);
              reject({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                data: {
                  message: HttpStatusMessagesConstants.FILE.FAIL_READ_500,
                },
              });
            })
            .on('end', () => {
              httpLogger.debug(`[FILE] readCSV: ${dir}`);
              resolve(results);
            });
        }
      });
    } catch (error) {
      httpLogger.error(`[FILE] readCSV: ${dir}, ${errorToJson(error)}`);
      reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: { message: HttpStatusMessagesConstants.FILE.FAIL_READ_500 },
      });
    }
  });
}

export async function saveCsv(dir: string, data: any[]) {
  return new Promise(async (resolve, reject) => {
    try {
      const csvData = data.map((row) => row.join(',')).join('\n');
      // JSON 데이터를 파일로 저장
      fs.writeFile(dir, csvData, (err) => {
        if (err) {
          httpLogger.error(`[FILE] saveCSV: ${dir}, ${errorToJson(err)}`);
          reject({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: HttpStatusMessagesConstants.FILE.FAIL_WRITE_500,
          });
        }
        httpLogger.debug(`[FILE] saveCsv: ${dir}, ${errorToJson(data)}`);
        resolve({
          message: HttpStatusMessagesConstants.FILE.SUCCESS_WRITE_201,
        });
      });
    } catch (error) {
      httpLogger.error(`[FILE] saveCsv: ${dir}, ${errorToJson(error)}`);
      reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: { message: HttpStatusMessagesConstants.FILE.FAIL_WRITE_500 },
      });
    }
  });
}
