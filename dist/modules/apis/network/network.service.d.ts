import { NetworkPayload } from '@common/interface/network/network.interface';
import * as wifi from 'node-wifi';
export declare class NetworkService {
    constructor();
    private wifi_list;
    private curEthernet;
    private curWifi;
    private curBluetooth;
    private isPlatformMac;
    private isPlatformWindows;
    NetworkInit(): Promise<void>;
    wifiScan(): Promise<unknown>;
    private scanWifiNetworks;
    getWifiList(): Promise<wifi.WiFiNetwork[]>;
    getNetwork(): Promise<unknown>;
    parseMacNetworkInfo(inputString: string): Promise<void>;
    hexMaskToCidr(hexMask: string): number;
    transNMCLI(inputString: string): Promise<NetworkPayload>;
    getCurrentWifi(): Promise<wifi.WiFiNetwork[]>;
    setIP(info: any): Promise<unknown>;
    cidrToNetmask(cidr: string): string;
    connectWifi(info: any): Promise<unknown>;
}
