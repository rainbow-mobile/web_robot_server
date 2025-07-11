import { AutoMoveType, NodeState, PathType } from '@common/enum/move.enum';
export interface MoveStatusPayload {
    move_state: {
        auto_move: AutoMoveType;
        dock_move: string;
        jog_move: string;
        obs: string;
        path: PathType;
    };
    pose: {
        x: string;
        y: string;
        rz: string;
    };
    vel: {
        vx: string;
        vy: string;
        wz: string;
    };
    goal_node: {
        id: string;
        name: string;
        state: NodeState;
        x: string;
        y: string;
        rz: string;
    };
    cur_node: {
        id: string;
        name: string;
        state: NodeState;
        x: string;
        y: string;
        rz: string;
    };
    time: string;
}
