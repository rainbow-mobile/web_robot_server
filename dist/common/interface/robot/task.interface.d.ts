export interface TaskPayload {
    connection: boolean;
    file: string;
    id: number;
    running: boolean;
    variables?: any[];
    result?: string | undefined;
}
