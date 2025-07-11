import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { TaskPayload } from '@common/interface/robot/task.interface';
export declare class TaskService {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    getTaskList(path: string): Promise<any[]>;
    getTaskInfo(): Promise<TaskPayload>;
    loadTask(path: string): Promise<unknown>;
    runTask(): Promise<unknown>;
    stopTask(): Promise<unknown>;
    findKeyword(line: any): Promise<string>;
    findValue(line: any): any;
    findValueSub(keyword: any, line: any): any;
    findSocketChildren(line: any): any;
    textToTreeData(text: any): Promise<{
        key: string;
        label: string;
        children: any[];
    }[]>;
    parse(dir: string): Promise<unknown>;
    save(dir: any, data: any): Promise<unknown>;
    treeToText(tree: any): Promise<string>;
    list(dir: any): Promise<any[]>;
}
