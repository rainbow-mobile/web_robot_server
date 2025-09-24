import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';


enum Description {
  COMMAND = '실행할 컨트롤 명령',
  ID = '요청한 명령의 ID값입니다. request시 자동 생성됩니다.',
  RESULT = '요청한 명령에 대한 결과입니다. accept, reject, success, fail 등 명령에 대해 다양한 값이 존재합니다.',
  MESSAGE = 'result값이 reject, fail 인 경우 SLAMNAV에서 보내는 메시지 입니다.',
  ONOFF = 'LED 수동제어기능을 켜고 끌지를 결정합니다. 값이 true일 때 요청하는 color 값을 사용하며, 값이 false인 경우에는 수동제어기능을 끄고 color 값도 무시합니다. 로봇의 상태에 따라 자동으로 LED 색상이 변경됩니다.',
  LED = 'LED 색상을 입력합니다. onoff가 true일 경우에만 사용됩니다.',
  FREQ = '기능에 따라 onoff가 true일 시, 전송 주기를 입력하세요. 단위는 Hz이며 예로 lidarOnOff를 on하고 frequency를 10으로 입력하면 lidar 데이터를 10Hz로 송신합니다.',
  ROBOT_SERIAL = '로봇 시리얼 번호',
  SAFETY_FIELD = '안전 필드 설정. 사전에 설정된 안전필드 ID값을 입력하세요',
  MCU_DIO = 'MCU DIO 제어. 0번 핀부터 7번 핀까지 순서대로 입력하세요. 예로 [0,0,0,0,0,1,1,1] 은 0번 핀부터 7번 핀까지 순서대로 0,0,0,0,0,1,1,1 로 제어합니다.',
}
export enum ControlCommand {
    dockStart = 'dock',
    undockStart = 'undock',
    randomSeq = 'randomSeq',
    ledControl = 'ledControl',
    lidarOnOff = 'lidarOnOff',
    pathOnOff = 'pathOnOff',
    motorOnOff = 'motorOnOff',
    safetyFieldControl = 'safetyFieldControl',
    setSafetyField = 'setSafetyField',
    getSafetyField = 'getSafetyField',
    resetSafetyField = 'resetSafetyField',
    footMove = 'footMove',
    footStop = 'footStop',
    safetyIoControl = 'safetyIoControl',
    setObsBox = 'setObsBox',
    getObsBox = 'getObsBox',
  }
  
export class ControlRequestDto {
  @ApiProperty({
    description: Description.COMMAND,
    example: ControlCommand.dockStart,
    enum: ControlCommand,
    required: true,
  })
  @IsString()
  @Length(1, 50)
  @Expose()
  command: string;

//   @ApiProperty({
//     description: Description.ONOFF,
//     example: true,
//     type: 'boolean',
//     required: false,
//   })
//   @IsOptional()
//   @IsBoolean()
//   @Expose()
//   onoff?: boolean;

//   @ApiProperty({
//     description: Description.LED,
//     example: LEDColor.red,
//     enum: LEDColor,
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   @Length(1, 50)
//   color?: string;

//   @ApiProperty({
//     description: Description.FREQ,
//     example: 10,
//     required: false,
//   })
//   @IsNumber()
//   @IsOptional()
//   @Expose()
//   frequency?: number;

//   @ApiProperty({
//     description: Description.MCU_DIO,
//     example: [
//       [0, 0, 0, 0, 0, 1, 1, 1],
//       [1, 0, 0, 0, 0, 0, 0, 0],
//     ],
//     required: false,
//   })
//   @IsArray()
//   @IsOptional()
//   mcu_dio?: number[][];

//   @ApiProperty({
//     description: Description.SAFETY_FIELD,
//     example: '1',
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   @Expose()
//   safetyField?: string;
}

export class ControlResponseDto extends ControlRequestDto {}

export class ControlRequestSlamnav extends ControlRequestDto {
  @ApiProperty({
    description: Description.ID,
    example: uuidv4(),
    required: true,
  })
  @IsString()
  @Length(1, 50)
  @Expose()
  id: string;
}

export class ControlResponseSlamnav extends ControlResponseDto {
  @ApiProperty({
    description: Description.ID,
    example: uuidv4(),
    required: true,
  })
  @IsString()
  @Length(1, 50)
  @Expose()
  id: string;

  @ApiProperty({
    description: Description.RESULT,
    example: 'accept',
    required: true,
  })
  @IsString()
  @Length(1, 50)
  result: string;

  @ApiProperty({
    description: Description.MESSAGE,
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  message?: string;
}

export class ControlResponseFrs {
  @ApiProperty({
    description: Description.ROBOT_SERIAL,
    example: uuidv4(),
    required: true,
  })
  @IsString()
  @Length(1, 50)
  robotSerial: string;

  @ApiProperty({
    description: '컨트롤 명령 결과',
    type: ControlResponseDto,
    required: true,
  })
  data: ControlResponseDto;
}

export class ObsBoxRequestDto { 
    @ApiProperty({
        description: '장애물감지영역 최소 z값 (0~5m)',
        example: '1.3',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minZ?: number;

    @ApiProperty({
        description: '장애물감지영역 최대 z값 (0~5m)',
        example: '1.3',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxZ?: number;

    @ApiProperty({
        description: '장애물감지영역 맵 범위 (0~5m)',
        example: '1.3',
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    mapRange?: number;
}

export class ObsBoxResponseDto extends ObsBoxRequestDto {}

export class ObsBoxRequestSlamnav extends ObsBoxRequestDto {
  @ApiProperty({
    description: '장애물감지영역 설정 명령',
    example: ControlCommand.setObsBox,
    required: true,
  })
  @IsString()
  @Length(1, 50)
  @Expose()
  command: string;
}
export class OnOffRequestDto {
  @ApiProperty({
    description: 'OnOff 명령을 사용할 Command를 입력하세요. 현재 사용가능한 Command는 lidarOnOff, pathOnOff, motorOnOff가 있습니다.',
    example: 'lidarOnOff',
    required: true,
  })
  @IsString()
  @Length(1, 50)
  @Expose()
  command: string;

  @ApiProperty({
    description: '기능을 켜고 끌지를 결정합니다.',
    example: true,
    required: true,
  })
  @IsBoolean()
  @Expose()
  onoff: boolean;

  @ApiProperty({
    description:
      '기능에 따라 onoff가 true일 시, 전송 주기를 입력하세요. 단위는 Hz이며 예로 lidarOnOff를 on하고 frequency를 10으로 입력하면 lidar 데이터를 10Hz로 송신합니다.',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  @Expose()
  frequency?: number;
}

export class OnOffResponseDto {
  @ApiProperty({
    description: 'OnOff 명령을 실행한 Command',
    example: 'lidarOnOff',
    required: true,
  })
  @IsString()
  @Length(1, 50)
  @Expose()
  command: string;

  @ApiProperty({
    description: '기능을 켰는지/껐는지 여부',
    example: true,
    required: true,
  })
  @IsBoolean()
  @Expose()
  onoff: boolean;

  @ApiProperty({
    description: '주기(Hz). onoff가 true일 때만 의미 있음',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Expose()
  frequency?: number;
}

export class WorkRequestDto {
  @ApiProperty({
    description: '실행할 Command를 입력하세요. 현재 사용가능한 Command는 dock, undock, randomSeq가 있습니다.',
    example: 'dock',
    required: true,
  })
  @IsString()
  @Length(1, 50)
  @Expose()
  command: string;
}

export class WorkResponseDto {
  @ApiProperty({ description: '실행한 명령', example: 'dock' })
  @IsString()
  @Expose()
  command: string;
}

export class SafetyFieldRequestDto {
  @ApiProperty({ description: '세이프티 영역', example: '1' })
  @IsString()
  @Expose()
  safetyField: string;
}

export class SafetyFieldResponseDto extends SafetyFieldRequestDto {}
