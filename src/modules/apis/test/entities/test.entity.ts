import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum SubjectEnum {
  DISPLAY = 'DISPLAY',
  SPEAKER = 'SPEAKER',
  CAMERA = 'CAMERA',
  CHARGER = 'CHARGER',
  MAP_MOVE = 'MAP_MOVE',
}

export enum TestResult {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

@Entity('test')
export class TestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'subject',
    type: 'enum',
    enum: SubjectEnum,
  })
  subject: SubjectEnum;

  @Column({
    name: 'result',
    type: 'enum',
    enum: TestResult,
    nullable: true,
    default: null,
  })
  result: TestResult | null;

  @Column({
    name: 'init_tester',
    type: 'varchar',
    length: 128,
    nullable: true,
    default: null,
  })
  initTester: string | null;

  @Column({
    name: 'testAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  testAt: Date;
}
