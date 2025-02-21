import { Module } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { VariablesController } from './variables.controller';
import { VariablesEntity } from './entity/variables.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogModule } from '../log/log.module';

@Module({
  imports:[
    // LogModule,
    TypeOrmModule.forFeature([
      VariablesEntity
    ])
  ],
  controllers: [VariablesController],
  providers: [VariablesService],
  exports: [VariablesService]
})
export class VariablesModule {}
