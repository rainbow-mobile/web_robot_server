import { StatusConditionEntity } from './status/condition.entity';
import { StatusStateEntity } from './status/state.entity';
import { StatusMotorEntity } from './status/motor.entity';
import { StatusImuEntity } from './status/imu.entity';
import { StatusPowerEntity } from './status/power.entity';
import { StatusPosEntity } from './status/pos.entity';
import { StatusTaskEntity } from './status/task.entity';
export declare class StatusLogEntity {
    time: Date;
    slam: boolean;
    type: string;
    conditions: StatusConditionEntity;
    robot_state: StatusStateEntity;
    move_state: StatusStateEntity;
    motor0: StatusMotorEntity;
    motor1: StatusMotorEntity;
    imu: StatusImuEntity;
    power: StatusPowerEntity;
    pose: StatusPosEntity;
    task: StatusTaskEntity;
}
