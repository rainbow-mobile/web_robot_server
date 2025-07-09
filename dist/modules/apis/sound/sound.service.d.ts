export declare class SoundService {
    private player;
    private curPlay;
    play(body: any): Promise<unknown>;
    playLoop(body: any): Promise<unknown>;
    stop(): Promise<void>;
    getList(path: string): Promise<any[]>;
}
