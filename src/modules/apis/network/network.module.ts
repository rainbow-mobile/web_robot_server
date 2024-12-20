import { Module } from '@nestjs/common';
import { NetworkService } from './network.service';
import { NetworkController } from './network.controller';
import { VariablesModule } from '../variables/variables.module';

@Module({
  imports: [VariablesModule],
  controllers: [NetworkController],
  providers: [NetworkService],
})
export class NetworkModule {}
