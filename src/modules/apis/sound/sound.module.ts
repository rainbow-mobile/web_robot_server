import { Module } from '@nestjs/common';
import { SoundService } from './sound.service';
import { SoundController } from './sound.controller';

@Module({
  controllers: [SoundController],
  providers: [SoundService],
})
export class SoundModule {}
