import {
  Body,
  Controller,
  Get,
  Param,
  Res,
  Patch,
  Put,
  Delete,
  Post,
} from '@nestjs/common';
import { VariablesService } from './variables.service';
import { VariablesEntity } from './entity/variables.entity';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VariableDto } from './dto/variables.dto';
import { Response } from 'express';

@ApiTags('DB 관련 API (variables)')
@Controller('variables')
export class VariablesController {
  constructor(private readonly variablesService: VariablesService) {
    console.log('variables constructor');
  }

  @Get()
  @ApiOperation({
    summary: 'Variables DB 조회',
    description: 'DB에 저장된 variables 데이터를 전부 조회합니다',
  })
  findAll(): Promise<VariablesEntity[]> {
    return this.variablesService.getVariables();
  }

  @Get(':key')
  @ApiOperation({
    summary: 'Variables DB 조회(키)',
    description: 'DB에 저장된 variables key값에 해당하는 데이터를 조회합니다',
  })
  async findOne(@Param('key') key: string): Promise<string | null> {
    return await this.variablesService.getVariable(key);
  }

  @Put()
  @ApiOperation({
    summary: 'Variables DB 업데이트',
    description: 'Variables DB의 이미 존재하는 값을 업데이트합니다',
  })
  async updateVariable(@Body() data: VariableDto, @Res() res: Response) {
    try {
      const response = await this.variablesService.updateVariable(
        data.key,
        data.value,
      );

      res.send(response);
    } catch (error) {
      res.status(error.status).send(error.data);
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Variables DB 업데이트',
    description: 'Variables DB에 데이터를 추가하거나 업데이트합니다',
  })
  async insertVariable(@Body() data: VariableDto, @Res() res: Response) {
    try {
      const response = await this.variablesService.upsertVariable(
        data.key,
        data.value,
      );
      res.send(response);
    } catch (error) {
      res.status(error.status).send(error.data);
    }
  }

  @Delete(':key')
  @ApiOperation({
    summary: 'Variables 삭제',
    description: 'Variables DB에 key값에 해당하는 데이터를 삭제합니다',
  })
  async deleteVariable(@Param('key') key: string, @Res() res: Response) {
    try {
      const response = await this.variablesService.deleteVariable(key);
      res.send(response);
    } catch (error) {
      res.status(error.status).send(error.data);
    }
  }
}
