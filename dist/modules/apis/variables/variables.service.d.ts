import { VariablesEntity } from './entity/variables.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
export declare class VariablesService {
    private readonly variablesRepository;
    private readonly socketGateway;
    private readonly configService;
    constructor(variablesRepository: Repository<VariablesEntity>, socketGateway: SocketGateway, configService: ConfigService);
    getVariables(): Promise<VariablesEntity[]>;
    getVariable(key: string): Promise<string | null>;
    deleteVariable(key: string): Promise<unknown>;
    upsertVariable(key: string, value: string): Promise<unknown>;
    updateVariable(key: string, value: string): Promise<unknown>;
}
