import { SoundService } from './sound.service';
import { SoundPlayDto } from './dto/sound.play.dto';
import { Response, Request } from 'express';
export declare class SoundController {
    private readonly soundService;
    constructor(soundService: SoundService);
    playSound(body: SoundPlayDto, res: Response): Promise<void>;
    playStop(res: Response): Promise<void>;
    getFileList(res: Response): Promise<void>;
    deleteSound(name: string, res: Response): Promise<void>;
    addSoundFile(req: Request, res: Response): Promise<void>;
}
