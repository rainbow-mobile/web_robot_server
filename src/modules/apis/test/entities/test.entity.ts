import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

@Entity('test_record')
export class TestRecordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'tester',
    type: 'varchar',
    length: 128,
  })
  tester: string;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updatedAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => TestEntity, (test) => test.testRecord)
  tests: TestEntity[];
}

@Entity('test')
export class TestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'test_record_id',
    type: 'int',
  })
  testRecordId: number;

  @ManyToOne(() => TestRecordEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'test_record_id' })
  testRecord: TestRecordEntity;

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
    name: 'testAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  testAt: Date;
}
