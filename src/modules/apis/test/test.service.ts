import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TestEntity } from './entities/test.entity';
import { Repository } from 'typeorm';
import httpLogger from '@common/logger/http.logger';
import { errorToJson } from '@common/util/error.util';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import {
  GetRecentTestResultBySubjectDto,
  GetTestResultBySubjectDto,
  GetTestResultListDto,
  ResponseTestResultDto,
  ResponseTestResultListDto,
  UpdateTestDataDto,
} from './dto/test.dto';
import { PaginationResponse } from '@common/pagination/pagination.response';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(TestEntity)
    private readonly testRepository: Repository<TestEntity>,
  ) {
    this.checkTestTable();
  }

  checkTestTable() {
    return this.testRepository.query(`
      CREATE TABLE IF NOT EXISTS test (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(128),
        result VARCHAR(128),
        init_tester VARCHAR(128),
        testAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  upsertTestResult(updateTestDataDto: UpdateTestDataDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const test = this.testRepository.create(updateTestDataDto);
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

  getRecentTestResultBySubject({
    subjects,
  }: GetRecentTestResultBySubjectDto): Promise<ResponseTestResultDto> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.testRepository
          .createQueryBuilder('test')
          .where('test.subject IN (:...subjects)', { subjects })
          .andWhere((qb) => {
            const subQuery = qb
              .subQuery()
              .select('t2.id')
              .from(TestEntity, 't2')
              .where('t2.subject = test.subject')
              .orderBy('t2.testAt', 'DESC')
              .limit(1)
              .getQuery();
            return 'test.id = ' + subQuery;
          })
          .orderBy('test.testAt', 'DESC')
          .getMany();

        resolve({
          items: result,
        });
      } catch (error) {
        httpLogger.error(`[TEST] getTestResult : ${errorToJson(error)}`);

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

  getTestResultAll(
    param: GetTestResultListDto,
  ): Promise<ResponseTestResultListDto> {
    return new Promise(async (resolve, reject) => {
      try {
        const queryBuilder = this.testRepository.createQueryBuilder('test');

        if (param.startDt) {
          const startDate = new Date(param.startDt);
          startDate.setHours(0, 0, 0, 0);
          queryBuilder.andWhere('test.testAt >= :startDt', {
            startDt: startDate,
          });
        }

        if (param.endDt) {
          const endDate = new Date(param.endDt);
          endDate.setHours(23, 59, 59, 999);
          queryBuilder.andWhere('test.testAt <= :endDt', { endDt: endDate });
        }

        if (param.subject && param.subject.length > 0) {
          queryBuilder.andWhere('test.subject IN (:...subjects)', {
            subjects: param.subject,
          });
        }

        if (param.initTester) {
          queryBuilder.andWhere('test.init_tester LIKE :initTester', {
            initTester: `%${param.initTester}%`,
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

        queryBuilder.orderBy('test.testAt', param.orderBy);

        const totalCount = await queryBuilder.getCount();

        const items = await queryBuilder
          .skip(param.getOffset())
          .take(param.getLimit())
          .getMany();

        resolve(new PaginationResponse(totalCount, param.getLimit(), items));
      } catch (error) {
        httpLogger.error(`[TEST] getTestResultAll : ${errorToJson(error)}`);

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
