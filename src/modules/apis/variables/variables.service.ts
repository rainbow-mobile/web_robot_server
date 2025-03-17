import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VariablesEntity } from './entity/variables.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import httpLogger from '@common/logger/http.logger';
import { errorToJson } from '@common/util/error.util';

@Injectable()
export class VariablesService {
  constructor(
    @InjectRepository(VariablesEntity)
    private readonly variablesRepository: Repository<VariablesEntity>,
    private readonly configService: ConfigService,
  ) {}

  async getVariables(): Promise<VariablesEntity[]> {
    return this.variablesRepository.find();
  }

  async getVariable(key: string): Promise<string | null> {
    const result = await this.variablesRepository.findOne({ where: { key } });

    if (result) {
      return result.value;
    } else {
      return null;
    }
  }

  async deleteVariable(key: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.variablesRepository.delete(key);
        resolve({ message: HttpStatusMessagesConstants.DB.SUCCESS_DELETE_200 });
      } catch (error) {
        httpLogger.error(
          `[UPLOAD] deleteVariable: (${key}), ${errorToJson(error)}`,
        );
        reject({
          message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    });
  }

  async upsertVariable(key: string, value: string) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.variablesRepository.save({ key: key, value: value });
        resolve({
          data: {
            key: key,
            value: value,
            message: HttpStatusMessagesConstants.DB.SUCCESS_WRITE_201,
          },
        });
      } catch (error) {
        httpLogger.error(
          `[UPLOAD] upsertVariable : (${key}, ${value}) ${errorToJson(error)}`,
        );
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
          },
        });
      }
    });
  }

  async updateVariable(key: string, value: string) {
    return new Promise(async (resolve, reject) => {
      const result = await this.variablesRepository.findOne({ where: { key } });

      if (result) {
        try {
          await this.variablesRepository.save({ key: key, value: value });
          resolve({
            data: {
              key: key,
              value: value,
              message: HttpStatusMessagesConstants.DB.SUCCESS_WRITE_201,
            },
          });
        } catch (error) {
          httpLogger.error(
            `[UPLOAD] updateVariable: (${key}, ${value}) ${errorToJson(error)}`,
          );
          reject({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            data: {
              message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            },
          });
        }
      } else {
        httpLogger.error(
          `[UPLOAD] updateVariable: (${key}, ${value}) Key Not Found`,
        );
        reject({
          status: HttpStatus.NOT_FOUND,
          data: { message: HttpStatusMessagesConstants.DB.NOT_FOUND_404 },
        });
      }
    });
  }
}
