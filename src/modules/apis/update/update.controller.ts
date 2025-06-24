import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { UpdateService } from './update.service';
import { ReqUpdateSoftwareDto } from './dto/update.update.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetNewVersionDto, PingSendToTargetDto } from './dto/update.get.dto';

@ApiTags('업데이트 관련 API (update)')
@Controller('update')
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  @Post()
  @ApiOperation({
    summary: '소프트웨어 업데이트',
    description: '소프트웨어 업데이트를 요청합니다.',
  })
  updateSoftware(@Body() reqUpdateSoftwareDto: ReqUpdateSoftwareDto) {
    return this.updateService.updateSoftware(reqUpdateSoftwareDto);
  }

  @Get('ping')
  pingSendToTarget(@Query() { target }: PingSendToTargetDto) {
    return this.updateService.pingSendToTarget(target);
  }

  @Get(':software/get-new-version')
  @ApiOperation({
    summary: '소프트웨어 새로운 버전 조회',
    description:
      '소프트웨어 새로운 버전을 조회합니다. 위부망 접속이 안될 환경시 400 에러가 발생합니다.',
  })
  getNewVersion(
    @Param('software') software: string,
    @Query() { branch = 'main' }: GetNewVersionDto,
  ) {
    return this.updateService.getNewVersion({
      software,
      branch,
    });
  }

  @Get(':software/get-current-version')
  @ApiOperation({
    summary: '소프트웨어 현재 버전 조회',
    description: '소프트웨어 현재 버전을 조회합니다.',
  })
  getCurrentVersion(@Param('software') software: string) {
    return this.updateService.getCurrentVersion(software);
  }
}
