import { forwardRef, Module } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { VariablesController } from './variables.controller';
import { VariablesEntity } from './entity/variables.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketsModule } from '@sockets/sockets.module';

@Module({
  imports: [
    // LogModule,
    TypeOrmModule.forFeature([VariablesEntity]),
    forwardRef(() => SocketsModule),
  ],
  controllers: [VariablesController],
  providers: [VariablesService],
  exports: [VariablesService],
})
export class VariablesModule {}
