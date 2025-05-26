import { IsString, Length } from 'class-validator';

export class SubscribeDto {
  @IsString()
  @Length(1, 50)
  topic: string;
}
