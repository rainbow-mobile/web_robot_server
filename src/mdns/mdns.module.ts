import { Module } from '@nestjs/common';
import { MdnsResponder } from './mdns.responder';
import { VariablesModule } from '../modules/apis/variables/variables.module';
import { NetworkModule } from '../modules/apis/network/network.module';

@Module({
  imports: [VariablesModule, NetworkModule],
  providers: [MdnsResponder],
  exports: [MdnsResponder],
})
export class MdnsModule {}
