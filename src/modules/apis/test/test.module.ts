import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { TestEntity, TestRecordEntity } from './entities/test.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TestEntity, TestRecordEntity])],
  controllers: [TestController],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}
