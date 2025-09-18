import { Module } from '@nestjs/common';
import { MdnsResponder } from './mdns.responder';

@Module({
  providers: [MdnsResponder],
  exports: [MdnsResponder],
})
export class MdnsModule {}
