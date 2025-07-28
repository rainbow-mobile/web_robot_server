import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TestEntity, TestRecordEntity } from './entities/test.entity';
import { Repository } from 'typeorm';
import httpLogger from '@common/logger/http.logger';
import { errorToJson } from '@common/util/error.util';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import {
  CheckTestRunningDto,
  GetRecentTestResultDto,
  GetTestRecordListDto,
  GetTestResultBySubjectDto,
  InsertTestDataDto,
  InsertTestRecordDto,
  ResponseTestRecordListDto,
  ResponseTestResultDto,
  StartTestDto,
  TestRunningInfoDto,
  UpdateTestDataDto,
  UpdateTestRecordDto,
} from './dto/test.dto';
import { PaginationResponse } from '@common/pagination/pagination.response';

@Injectable()
export class TestService {
  runningTestInfo: TestRunningInfoDto | null = null;

  constructor(
    @InjectRepository(TestEntity)
    private readonly testRepository: Repository<TestEntity>,
    @InjectRepository(TestRecordEntity)
    private readonly testRecordRepository: Repository<TestRecordEntity>,
  ) {
    this.checkTestTable();
    this.checkTestTableSchema();
    this.checkTestRecordTableSchema();
  }

  checkTestTable() {
    this.testRecordRepository.query(`
      CREATE TABLE IF NOT EXISTS test_record (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tester VARCHAR(128),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    this.testRepository.query(`
      CREATE TABLE IF NOT EXISTS test (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_record_id INT,
        subject VARCHAR(128),
        result ENUM('SUCCESS', 'FAIL') DEFAULT NULL,
        testAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_record_id) REFERENCES test_record(id)
      )
    `);
  }

  async checkTestTableSchema() {
    const expectedColumns = [
      { name: 'id', type: 'INT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'test_record_id', type: 'INT' },
      { name: 'subject', type: 'VARCHAR(128)' },
      { name: 'result', type: "ENUM('SUCCESS', 'FAIL') DEFAULT NULL" },
      { name: 'testAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
    ];

    // 실제 컬럼 정보 조회
    const columns: { COLUMN_NAME: string }[] = await this.testRepository.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'test'`,
    );
    const actualColumnNames = columns.map((col) => col.COLUMN_NAME);

    // 누락된 컬럼 찾기
    for (const col of expectedColumns) {
      if (!actualColumnNames.includes(col.name)) {
        // 컬럼이 없으면 ALTER TABLE로 추가
        await this.testRepository.query(
          `ALTER TABLE test ADD COLUMN ${col.name} ${col.type}`,
        );
        // 로그 남기기
        httpLogger.warn(
          `[TEST] test 테이블에 누락된 컬럼 '${col.name}'을(를) 추가했습니다.`,
        );
      }
    }

    for (const colName of actualColumnNames) {
      if (!expectedColumns.map((col) => col.name).includes(colName)) {
        await this.testRepository.query(
          `ALTER TABLE test DROP COLUMN ${colName}`,
        );
        httpLogger.warn(
          `[TEST] test 테이블에 불필요한 컬럼 '${colName}'을(를) 삭제했습니다.`,
        );
      }
    }
  }

  async checkTestRecordTableSchema() {
    const expectedColumns = [
      { name: 'id', type: 'INT AUTO_INCREMENT PRIMARY KEY' },
      { name: 'tester', type: 'VARCHAR(128)' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
    ];

    const columns: { COLUMN_NAME: string }[] =
      await this.testRecordRepository.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'test_record'`,
      );
    const actualColumnNames = columns.map((col) => col.COLUMN_NAME);

    for (const col of expectedColumns) {
      if (!actualColumnNames.includes(col.name)) {
        await this.testRecordRepository.query(
          `ALTER TABLE test_record ADD COLUMN ${col.name} ${col.type}`,
        );
        httpLogger.warn(
          `[TEST] test_record 테이블에 누락된 컬럼 '${col.name}'을(를) 추가했습니다.`,
        );
      }
    }

    for (const colName of actualColumnNames) {
      if (!expectedColumns.map((col) => col.name).includes(colName)) {
        await this.testRecordRepository.query(
          `ALTER TABLE test_record DROP COLUMN ${colName}`,
        );
        httpLogger.warn(
          `[TEST] test_record 테이블에 불필요한 컬럼 '${colName}'을(를) 삭제했습니다.`,
        );
      }
    }
  }

  insertTestRecord(data: InsertTestRecordDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const testRecord = this.testRecordRepository.create(data);
        const result = await this.testRecordRepository.save(testRecord);

        for (const subject of data.subjects) {
          const test = this.testRepository.create({
            testRecordId: result.id,
            subject: subject,
          });

          await this.testRepository.save(test);
        }

        resolve(result);
      } catch (error) {
        httpLogger.error(`[TEST] insertTestRecord : ${errorToJson(error)}`);
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            error: error,
          },
        });
      }
    });
  }

  updateTestRecord(data: UpdateTestRecordDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const testRecord = await this.testRecordRepository.findOne({
          where: { id: data.id },
        });

        if (!testRecord) {
          reject({
            status: HttpStatus.NOT_FOUND,
            data: {
              message: HttpStatusMessagesConstants.DB.NOT_FOUND_404,
            },
          });
          return;
        }

        Object.assign(testRecord, data);
        const result = await this.testRecordRepository.save(testRecord);

        resolve(result);
      } catch (error) {
        httpLogger.error(`[TEST] updateTestRecord : ${errorToJson(error)}`);
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            error: error,
          },
        });
      }
    });
  }

  insertTestResult(data: InsertTestDataDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const { isRunning } = await this.checkTestRunning();

        if (isRunning) {
          reject({
            status: HttpStatus.BAD_REQUEST,
            data: {
              message: `이미 테스트 중입니다. testRecordId: ${this.runningTestInfo?.testRecordId}`,
            },
          });

          return;
        }

        const test = this.testRepository.create(data);
        const result = await this.testRepository.save(test);

        resolve(result);
      } catch (error) {
        httpLogger.error(`[TEST] insertTestResult : ${errorToJson(error)}`);
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            error: error,
          },
        });
      }
    });
  }

  upsertTestResult(updateTestDataDto: UpdateTestDataDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const { isRunning, testRecordId } = await this.checkTestRunning();

        if (!isRunning) {
          reject({
            status: HttpStatus.BAD_REQUEST,
            data: {
              message:
                '테스트 시작 API를 통해 테스트를 시작하지 않았습니다. 테스트 시작 API를 통해 테스트를 시작하세요.',
            },
          });

          return;
        } else if (testRecordId !== updateTestDataDto.testRecordId) {
          reject({
            status: HttpStatus.BAD_REQUEST,
            data: {
              message: `테스트중인 테스트 레코드가 아닙니다. testRecordId: ${testRecordId}`,
            },
          });

          return;
        }

        this.runningTestInfo.testEndTimestamp = Date.now() + 1000 * 60 * 5;

        const test = await this.testRepository.findOne({
          where: {
            testRecordId: updateTestDataDto.testRecordId,
            subject: updateTestDataDto.subject,
          },
        });

        if (!test) {
          const result = await this.insertTestResult(updateTestDataDto);
          resolve(result);
          return;
        }

        Object.assign(test, updateTestDataDto);
        const result = await this.testRepository.save(test);

        resolve(result);
      } catch (error) {
        httpLogger.error(
          `[TEST] upsertTestResult : (${updateTestDataDto}) ${errorToJson(error)}`,
        );
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            error: error,
          },
        });
      }
    });
  }

  getTestRecord(testRecordId: number) {
    return new Promise(async (resolve, reject) => {
      try {
        const queryBuilder = this.testRecordRepository
          .createQueryBuilder('test_record')
          .where('test_record.id = :testRecordId', { testRecordId })
          .leftJoinAndSelect('test_record.tests', 'tests');

        const result = await queryBuilder.getOne();

        if (!result) {
          reject({
            status: HttpStatus.NOT_FOUND,
            data: {
              message: HttpStatusMessagesConstants.DB.NOT_FOUND_404,
            },
          });
          return;
        }

        resolve(result);
      } catch (error) {
        httpLogger.error(
          `[TEST] getTestResultByTestRecordId : ${errorToJson(error)}`,
        );
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            error: error,
          },
        });
      }
    });
  }

  getRecentTestResult({
    subjects,
  }: GetRecentTestResultDto): Promise<ResponseTestResultDto> {
    return new Promise(async (resolve, reject) => {
      try {
        const latestTestRecord = await this.testRecordRepository
          .createQueryBuilder('test_record')
          .orderBy('test_record.createdAt', 'DESC')
          .limit(1)
          .getOne();

        if (!latestTestRecord) {
          resolve({
            items: [],
          });
          return;
        }

        const queryBuilder = this.testRepository
          .createQueryBuilder('test')
          .where('test.test_record_id = :testRecordId', {
            testRecordId: latestTestRecord.id,
          });

        if (subjects && subjects.length > 0) {
          queryBuilder.andWhere('test.subject IN (:...subjects)', { subjects });
        }

        const result = await queryBuilder
          .orderBy('test.testAt', 'DESC')
          .getMany();

        resolve({
          items: result,
        });
      } catch (error) {
        httpLogger.error(
          `[TEST] getRecentTestResultBySubject : ${errorToJson(error)}`,
        );

        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            error: error,
          },
        });
      }
    });
  }

  getTestResultBySubject({
    subject,
  }: GetTestResultBySubjectDto): Promise<ResponseTestResultDto> {
    return new Promise(async (resolve, reject) => {
      try {
        const items = await this.testRepository
          .createQueryBuilder('test')
          .where('test.subject = :subject', { subject })
          .orderBy('test.testAt', 'DESC')
          .getMany();

        resolve({
          items,
        });
      } catch (error) {
        httpLogger.error(
          `[TEST] getTestResultBySubject : ${errorToJson(error)}`,
        );

        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            error: error,
          },
        });
      }
    });
  }

  getTestRecordAll(
    param: GetTestRecordListDto,
  ): Promise<ResponseTestRecordListDto> {
    return new Promise(async (resolve, reject) => {
      try {
        const queryBuilder = this.testRecordRepository
          .createQueryBuilder('test_record')
          .leftJoinAndSelect('test_record.tests', 'tests');

        if (param.startDt) {
          const startDate = new Date(param.startDt);
          startDate.setHours(0, 0, 0, 0);
          queryBuilder.andWhere('test_record.createdAt >= :startDt', {
            startDt: startDate,
          });
        }

        if (param.endDt) {
          const endDate = new Date(param.endDt);
          endDate.setHours(23, 59, 59, 999);
          queryBuilder.andWhere('test_record.createdAt <= :endDt', {
            endDt: endDate,
          });
        }

        if (param.tester) {
          queryBuilder.andWhere('test_record.tester LIKE :tester', {
            tester: `%${param.tester}%`,
          });
        }

        if (param.subject && param.subject.length > 0) {
          queryBuilder.andWhere('tests.subject IN (:...subjects)', {
            subjects: param.subject,
          });
        }

        if (!param.pageNo) {
          const items = await queryBuilder.getMany();
          const totalCount = items.length;
          resolve({
            totalCount,
            items,
          });
          return;
        }

        queryBuilder.orderBy('test_record.createdAt', param.orderBy);

        const totalCount = await queryBuilder.getCount();

        const items = await queryBuilder
          .skip(param.getOffset())
          .take(param.getLimit())
          .getMany();

        resolve(new PaginationResponse(totalCount, param.getLimit(), items));
      } catch (error) {
        httpLogger.error(`[TEST] getTestRecordAll : ${errorToJson(error)}`);

        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            error: error,
          },
        });
      }
    });
  }

  observeTestRunning() {
    if (this.runningTestInfo) {
      if (this.runningTestInfo.testEndTimestamp < Date.now()) {
        this.endTest();
      } else {
        setTimeout(() => {
          this.observeTestRunning();
        }, 1000);
      }
    }
  }

  checkTestRunning(): Promise<CheckTestRunningDto> {
    return new Promise(async (resolve) => {
      if (this.runningTestInfo) {
        resolve({
          isRunning: true,
          testRecordId: this.runningTestInfo.testRecordId,
          tester: this.runningTestInfo.tester,
        });
      } else {
        resolve({
          isRunning: false,
        });
      }
    });
  }

  startTest(param: StartTestDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const { isRunning, testRecordId } = await this.checkTestRunning();

        if (isRunning && testRecordId !== param.testRecordId) {
          reject({
            status: HttpStatus.BAD_REQUEST,
            data: {
              message: `이미 테스트 중입니다. testRecordId: ${testRecordId}`,
            },
          });

          return;
        }

        this.runningTestInfo = {
          tester: param.tester,
          testRecordId: param.testRecordId,
          testEndTimestamp: Date.now() + 1000 * 60 * 5,
        };

        this.observeTestRunning();

        resolve(this.runningTestInfo);
      } catch (error) {
        httpLogger.error(`[TEST] startTest : ${errorToJson(error)}`);
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            error: error,
          },
        });
      }
    });
  }

  endTest() {
    return new Promise(async (resolve, reject) => {
      try {
        const { isRunning } = await this.checkTestRunning();

        if (!isRunning) {
          reject({
            status: HttpStatus.BAD_REQUEST,
            data: {
              message:
                '테스트 시작 API를 통해 테스트를 시작하지 않았습니다. 테스트 시작 API를 통해 테스트를 시작하세요.',
            },
          });

          return;
        }

        this.runningTestInfo = null;
        resolve({ result: true });
      } catch (error) {
        httpLogger.error(`[TEST] endTest : ${errorToJson(error)}`);
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            error: error,
          },
        });
      }
    });
  }
}
