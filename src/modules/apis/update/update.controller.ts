import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { UpdateService } from './update.service';
import {
  ReqUpdateSoftwareDto,
  ResponseWebUIAppAddDto,
  ResponseWebUIAppDeleteDto,
  WebUIAppAddDto,
  WebUIAppDeleteDto,
} from './dto/update.update.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  GetNewVersionDto,
  GetReleaseAppsBranchesDto,
  GetReleaseAppsVersionListDto,
  PingSendToTargetDto,
  ResponseReleaseAppsBranchesDto,
  ResponseReleaseVersionInfoDto,
} from './dto/update.get.dto';

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

  @Get('release-apps/branches')
  @ApiOperation({
    summary: 'rainbow-release-apps 레포지토리의 브랜치 조회',
    description: 'rainbow-release-apps 레포지토리의 브랜치를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'rainbow-release-apps 레포지토리의 브랜치 조회 성공',
    type: [ResponseReleaseAppsBranchesDto],
  })
  getReleaseAppsBranches(@Query() params: GetReleaseAppsBranchesDto) {
    return this.updateService.getReleaseAppsBranches(params);
  }

  @Get('release-apps/version-list')
  @ApiOperation({
    summary: 'rainbow-release-apps 레포지토리의 버전 조회',
    description: 'rainbow-release-apps 레포지토리의 버전을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'rainbow-release-apps 레포지토리의 버전 조회 성공',
    type: [ResponseReleaseVersionInfoDto],
  })
  getReleaseAppsVersionList(
    @Query()
    params: GetReleaseAppsVersionListDto,
  ) {
    return this.updateService.getReleaseAppsVersionList(params);
  }

  @Post('web-ui/app/add')
  @ApiOperation({
    summary: '웹 UI 앱 추가',
    description: '웹 UI 앱을 추가합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '웹 UI 앱 추가 성공',
    type: ResponseWebUIAppAddDto,
  })
  @ApiResponse({
    status: 400,
    description: '웹 UI 앱 추가 실패',
  })
  @ApiResponse({
    status: 404,
    description: '웹 UI 앱 추가 스크립트 파일을 찾을 수 없습니다.',
  })
  webUIAppAdd(@Body() webUIAppAddDto: WebUIAppAddDto) {
    return this.updateService.webUIAppAdd(webUIAppAddDto);
  }

  @Delete('web-ui/app/delete')
  @ApiOperation({
    summary: '웹 UI 앱 삭제',
    description: '웹 UI 앱을 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '웹 UI 앱 삭제 성공',
    type: ResponseWebUIAppDeleteDto,
  })
  @ApiResponse({
    status: 400,
    description: '웹 UI 앱 삭제 실패',
  })
  @ApiResponse({
    status: 404,
    description: '웹 UI 앱 삭제 스크립트 파일을 찾을 수 없습니다.',
  })
  webUIAppDelete(@Body() webUIAppDeleteDto: WebUIAppDeleteDto) {
    return this.updateService.webUIAppDelete(webUIAppDeleteDto);
  }
}
