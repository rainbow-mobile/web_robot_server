import { VariablesEntity } from './entity/variables.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
export declare class VariablesService {
    private readonly variablesRepository;
    private readonly configService;
    constructor(variablesRepository: Repository<VariablesEntity>, configService: ConfigService);
    getVariables(): Promise<VariablesEntity[]>;
    getVariable(key: string): Promise<string | null>;
    deleteVariable(key: string): Promise<unknown>;
    upsertVariable(key: string, value: string): Promise<unknown>;
    updateVariable(key: string, value: string): Promise<unknown>;
}
