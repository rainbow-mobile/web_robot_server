import { VariablesService } from './variables.service';
import { VariablesEntity } from './entity/variables.entity';
import { VariableDto } from './dto/variables.dto';
import { Response } from 'express';
export declare class VariablesController {
    private readonly variablesService;
    constructor(variablesService: VariablesService);
    findAll(): Promise<VariablesEntity[]>;
    findOne(key: string): Promise<string | null>;
    updateVariable(data: VariableDto, res: Response): Promise<void>;
    insertVariable(data: VariableDto, res: Response): Promise<void>;
    deleteVariable(key: string, res: Response): Promise<void>;
}
