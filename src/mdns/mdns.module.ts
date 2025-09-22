import { Module } from '@nestjs/common';
import { MdnsResponder } from './mdns.responder';
import { VariablesModule } from '../modules/apis/variables/variables.module';

@Module({
  imports: [VariablesModule],
  providers: [MdnsResponder],
  exports: [MdnsResponder],
})
export class MdnsModule {}
