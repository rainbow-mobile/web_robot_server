import {
  MotionCommand,
  MotionMethod,
} from 'src/modules/apis/motion/dto/motion.dto';

export interface MotionPayload {
  command: MotionCommand;
  method: MotionMethod;
}
