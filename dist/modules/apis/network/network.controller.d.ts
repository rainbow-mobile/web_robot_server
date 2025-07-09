import { NetworkService } from './network.service';
import { Response } from 'express';
import { NetworkDto } from './dto/network.dto';
import { NetworkWifiDto } from './dto/network.wifi.dto';
import { VariablesService } from '../variables/variables.service';
export declare class NetworkController {
    private readonly networkService;
    private readonly variableService;
    constructor(networkService: NetworkService, variableService: VariablesService);
    getCurrentNetwork(res: Response): Promise<Response<any, Record<string, any>>>;
    getCurrentNetworkWifi(res: Response): Promise<Response<any, Record<string, any>>>;
    getWifiList(res: Response): Promise<Response<any, Record<string, any>>>;
    scanWifiList(res: Response): Promise<Response<any, Record<string, any>>>;
    updateNetwork(data: NetworkDto, res: Response): Promise<Response<any, Record<string, any>>>;
    connectWifi(data: NetworkWifiDto, res: Response): Promise<Response<any, Record<string, any>>>;
}
