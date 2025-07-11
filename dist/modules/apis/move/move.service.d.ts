import { Repository } from 'typeorm';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { MoveLogEntity } from './entity/move.entity';
export declare class MoveService {
    private readonly moveRepository;
    private readonly socketGateway;
    constructor(moveRepository: Repository<MoveLogEntity>, socketGateway: SocketGateway);
    getMoveLog(num: number, command?: string): Promise<MoveLogEntity[]>;
    saveLog(data: {
        command: string;
        goal_id?: string;
        goal_name?: string;
        map_name?: string;
        x?: number;
        y?: number;
        rz?: number;
    }): Promise<void>;
    moveCommand(data: any): Promise<unknown>;
    moveJog(data: object): Promise<void>;
}
