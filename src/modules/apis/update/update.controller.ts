import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UpdateService } from './update.service';
import { ReqUpdateSoftwareDto } from './dto/update.dto';

@Controller('update')
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  @Post()
  updateSoftware(@Body() reqUpdateSoftwareDto: ReqUpdateSoftwareDto) {
    return this.updateService.updateSoftware(reqUpdateSoftwareDto);
  }

  @Get(':software/get-new-version')
  getNewVersion(
    @Param('software') software: string,
    @Query('branch') branch: string = 'main',
  ) {
    return this.updateService.getNewVersion({
      software,
      branch,
    });
  }

  @Get(':software/get-current-version')
  getCurrentVersion(@Param('software') software: string) {
    return this.updateService.getCurrentVersion(software);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUpdateDto: UpdateUpdateDto) {
  //   return this.updateService.update(+id, updateUpdateDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.updateService.remove(+id);
  }
}
