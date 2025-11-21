import { SoundPlayDto } from './dto/sound.play.dto';
export declare class SoundService {
    private player;
    private curPlay;
    private isLooping;
    play(body: SoundPlayDto): Promise<unknown>;
    playLoop(body: SoundPlayDto): Promise<unknown>;
    stop(): Promise<string>;
    getList(path: string): Promise<any[]>;
}
