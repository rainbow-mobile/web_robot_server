const schema = {
  asyncapi: '3.0.0',
  info: {
    title: 'RRS socket',
    version: '1.0.0',
    description: 'RRS에서 주고받는 socket.io 프로토콜 형식\n',
  },
  servers: {
    production: {
      host: 'localhost.com:11337',
      pathname: '/',
      protocol: 'ws',
    },
  },
  channels: {
    root: {
      messages: {
        localization: {
          summary: '위치초기화 명령',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: '위치초기화 명령',
                default: 'semiautoinit',
                enum: [
                  'semiautoinit',
                  'autoinit',
                  'init',
                  'start',
                  'stop',
                  'randominit',
                ],
                'x-parser-schema-id': '<anonymous-schema-2>',
              },
              x: {
                type: 'string',
                description: '초기화 로봇의 위치 X (command==init 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-3>',
              },
              y: {
                type: 'string',
                description: '초기화 로봇의 위치 Y (command==init 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-4>',
              },
              rz: {
                type: 'string',
                description:
                  '초기화 로봇의 위치 RZ (command==init 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-5>',
              },
              seed: {
                type: 'string',
                description:
                  '초기화 로봇의 노드 ID (command==randominit 일때만 참조)',
                default: '',
                'x-parser-schema-id': '<anonymous-schema-6>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-1>',
          },
          'x-parser-unique-object-id': 'localization',
          'x-parser-message-name': 'localization',
        },
        localizationResponse: {
          summary: '위치초기화 응답',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: '위치초기화 명령',
                default: 'semiautoinit',
                enum: [
                  'semiautoinit',
                  'autoinit',
                  'init',
                  'start',
                  'stop',
                  'randominit',
                ],
                'x-parser-schema-id': '<anonymous-schema-8>',
              },
              result: {
                type: 'string',
                description: '위치초기화 응답',
                default: 'success',
                enum: ['accept', 'reject', 'success', 'fail'],
                'x-parser-schema-id': '<anonymous-schema-9>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-7>',
          },
          'x-parser-unique-object-id': 'localizationResponse',
          'x-parser-message-name': 'localizationResponse',
        },
        load: {
          summary: 'SLAMNAV 로드요청',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: '로드 명령',
                default: 'mapload',
                enum: ['mapload'],
                'x-parser-schema-id': '<anonymous-schema-11>',
              },
              name: {
                type: 'string',
                description: '요청하는 맵 이름',
                default: 'map_test',
                'x-parser-schema-id': '<anonymous-schema-12>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-10>',
          },
          'x-parser-unique-object-id': 'load',
          'x-parser-message-name': 'load',
        },
        loadResponse: {
          summary: 'SLAMNAV 로드요청 응답',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: '로드 명령',
                default: 'mapload',
                enum: ['mapload'],
                'x-parser-schema-id': '<anonymous-schema-14>',
              },
              name: {
                type: 'string',
                description: '요청하는 맵 이름',
                default: 'map_test',
                'x-parser-schema-id': '<anonymous-schema-15>',
              },
              result: {
                type: 'string',
                description: '로드 응답',
                default: 'success',
                enum: ['accept', 'reject', 'success', 'fail'],
                'x-parser-schema-id': '<anonymous-schema-16>',
              },
              message: {
                type: 'string',
                description: 'result가 reject, fail 일때의 사유',
                default: '',
                'x-parser-schema-id': '<anonymous-schema-17>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-13>',
          },
          'x-parser-unique-object-id': 'loadResponse',
          'x-parser-message-name': 'loadResponse',
        },
        motor: {
          summary: '로봇 모터 제어명령',
          payload: {
            type: 'object',
            peoperties: {
              command: {
                type: 'string',
                description: '모터 제어 on/off',
                default: 'on',
                enum: ['on', 'off'],
              },
            },
            'x-parser-schema-id': '<anonymous-schema-18>',
          },
          'x-parser-unique-object-id': 'motor',
          'x-parser-message-name': 'motor',
        },
        led: {
          summary: 'LED 제어명령',
          payload: {
            type: 'object',
            peoperties: {
              command: {
                type: 'string',
                description:
                  'LED 수동제어 on/off. on인 경우 led 색상대로 켜지고 off인 경우 로봇 주행상태에 따라 자동 조절됨',
                default: 'on',
                enum: ['on', 'off'],
              },
              led: {
                type: 'string',
                description:
                  'LED 수동제어 색상. (left yellow blinke / right yellow blink는 s100 모델은 지원안함)',
                default: 'none',
                enum: [
                  'none',
                  'red',
                  'blue',
                  'white',
                  'green',
                  'magenta',
                  'yellow',
                  'red blink',
                  'blue blink',
                  'white blink',
                  'green blink',
                  'magenta blink',
                  'yellow blink',
                  'left yellow blink',
                  'right yellow blink',
                ],
              },
            },
            'x-parser-schema-id': '<anonymous-schema-19>',
          },
          'x-parser-unique-object-id': 'led',
          'x-parser-message-name': 'led',
        },
        lidarOnOff: {
          summary: 'lidarCloud 전송주기 제어명령',
          payload: {
            type: 'object',
            peoperties: {
              command: {
                type: 'string',
                description: '전송 on/off',
                default: 'on',
                enum: ['on', 'off'],
              },
              frequency: {
                type: 'string',
                description: '전송 주기 (HZ)',
                default: '1',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-20>',
          },
          'x-parser-unique-object-id': 'lidarOnOff',
          'x-parser-message-name': 'lidarOnOff',
        },
        pathOnOff: {
          summary: 'localPath, globalPath 전송주기 제어명령',
          payload: {
            type: 'object',
            peoperties: {
              command: {
                type: 'string',
                description: '전송 on/off',
                default: 'on',
                enum: ['on', 'off'],
              },
              frequency: {
                type: 'string',
                description: '전송 주기 (HZ)',
                default: '1',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-21>',
          },
          'x-parser-unique-object-id': 'pathOnOff',
          'x-parser-message-name': 'pathOnOff',
        },
        moveCommand: {
          summary: '이동 명령',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                default: 'goal',
                description: '이동 명령값',
                enum: ['goal', 'jog', 'target', 'pause', 'resume', 'stop'],
                'x-parser-schema-id': '<anonymous-schema-23>',
              },
              preset: {
                type: 'string',
                description: '속도 프리셋 (기본 0)',
                default: '0',
                'x-parser-schema-id': '<anonymous-schema-24>',
              },
              method: {
                type: 'string',
                description: '주행 방식',
                default: 'pp',
                enum: ['pp'],
                'x-parser-schema-id': '<anonymous-schema-25>',
              },
              goal_id: {
                type: 'string',
                description: '골 ID (command == goal 일때만 참조)',
                default: '',
                'x-parser-schema-id': '<anonymous-schema-26>',
              },
              x: {
                type: 'string',
                description: '골위치 X (command == target 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-27>',
              },
              y: {
                type: 'string',
                description: '골위치 Y (command == target 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-28>',
              },
              z: {
                type: 'string',
                description: '골위치 Z (command == target 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-29>',
              },
              rz: {
                type: 'string',
                default: '0.000',
                description: '골위치 RZ (command == target 일때만 참조)',
                'x-parser-schema-id': '<anonymous-schema-30>',
              },
              vx: {
                type: 'string',
                description: 'X방향 속도 (command == jog 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-31>',
              },
              vy: {
                type: 'string',
                description: 'Y방향 속도 (command == jog 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-32>',
              },
              wz: {
                type: 'string',
                description: '회전(Z)방향 속도 (command == jog 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-33>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-22>',
          },
          'x-parser-unique-object-id': 'moveCommand',
          'x-parser-message-name': 'moveCommand',
        },
        moveResponse: {
          summary: 'moveCommand 명령에 따른 응답',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                default: 'goal',
                description: '이동 명령값',
                enum: ['goal', 'jog', 'target', 'pause', 'resume', 'stop'],
                'x-parser-schema-id': '<anonymous-schema-35>',
              },
              result: {
                type: 'string',
                description: 'moveCommand 응답',
                default: 'accept',
                enum: ['accept', 'reject', 'success', 'fail'],
                'x-parser-schema-id': '<anonymous-schema-36>',
              },
              message: {
                type: 'string',
                description: 'result가 reject이나 fail일때 그 사유',
                default: '',
                'x-parser-schema-id': '<anonymous-schema-37>',
              },
              preset: {
                type: 'string',
                description: '속도 프리셋 (기본 0)',
                default: '0',
                'x-parser-schema-id': '<anonymous-schema-38>',
              },
              method: {
                type: 'string',
                description: '주행 방식',
                default: 'pp',
                enum: ['pp'],
                'x-parser-schema-id': '<anonymous-schema-39>',
              },
              goal_id: {
                type: 'string',
                description: '골 ID (command == goal 일때만 참조)',
                default: '',
                'x-parser-schema-id': '<anonymous-schema-40>',
              },
              x: {
                type: 'string',
                description: '골위치 X (command == target 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-41>',
              },
              y: {
                type: 'string',
                description: '골위치 Y (command == target 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-42>',
              },
              z: {
                type: 'string',
                description: '골위치 Z (command == target 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-43>',
              },
              rz: {
                type: 'string',
                default: '0.000',
                description: '골위치 RZ (command == target 일때만 참조)',
                'x-parser-schema-id': '<anonymous-schema-44>',
              },
              vx: {
                type: 'string',
                description: 'X방향 속도 (command == jog 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-45>',
              },
              vy: {
                type: 'string',
                description: 'Y방향 속도 (command == jog 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-46>',
              },
              wz: {
                type: 'string',
                description: '회전(Z)방향 속도 (command == jog 일때만 참조)',
                default: '0.000',
                'x-parser-schema-id': '<anonymous-schema-47>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-34>',
          },
          'x-parser-unique-object-id': 'moveResponse',
          'x-parser-message-name': 'moveResponse',
        },
        dock: {
          summary: '도킹 제어명령 (지원하는 모델만)',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: '도킹명령',
                default: 'dock',
                enum: ['dock', 'undock', 'dockstop'],
                'x-parser-schema-id': '<anonymous-schema-49>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-48>',
          },
          'x-parser-unique-object-id': 'dock',
          'x-parser-message-name': 'dock',
        },
        dockResponse: {
          summary: '도킹 제어명령 응답 (지원하는 모델만)',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: '도킹명령',
                default: 'dock',
                enum: ['dock', 'undock'],
                'x-parser-schema-id': '<anonymous-schema-51>',
              },
              result: {
                type: 'string',
                description: '도킹명령 응답',
                default: 'accept',
                enum: ['accept', 'reject', 'success', 'fail'],
                'x-parser-schema-id': '<anonymous-schema-52>',
              },
              message: {
                type: 'string',
                description: 'result == reject, fail 일때 사유',
                default: '',
                'x-parser-schema-id': '<anonymous-schema-53>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-50>',
          },
          'x-parser-unique-object-id': 'dockResponse',
          'x-parser-message-name': 'dockResponse',
        },
        mapping: {
          summary: '매핑 제어명령',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: '매핑명령',
                default: 'start',
                enum: ['start', 'stop', 'save'],
                'x-parser-schema-id': '<anonymous-schema-55>',
              },
              name: {
                type: 'string',
                description: '매핑한 맵 저장이름 (command == save 일때만 참조)',
                default: '',
                'x-parser-schema-id': '<anonymous-schema-56>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-54>',
          },
          'x-parser-unique-object-id': 'mapping',
          'x-parser-message-name': 'mapping',
        },
        mappingResponse: {
          summary: '도킹 제어명령 응답 (지원하는 모델만)',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: '매핑명령',
                default: 'start',
                enum: ['start', 'stop', 'save'],
                'x-parser-schema-id': '<anonymous-schema-58>',
              },
              name: {
                type: 'string',
                description: '매핑한 맵 저장이름 (command == save 일때만 참조)',
                default: '',
                'x-parser-schema-id': '<anonymous-schema-59>',
              },
              result: {
                type: 'string',
                description: '매핑명령 응답',
                default: 'accept',
                enum: ['accept', 'reject', 'success', 'fail'],
                'x-parser-schema-id': '<anonymous-schema-60>',
              },
              message: {
                type: 'string',
                description: 'result == reject, fail 일때 사유',
                default: '',
                'x-parser-schema-id': '<anonymous-schema-61>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-57>',
          },
          'x-parser-unique-object-id': 'mappingResponse',
          'x-parser-message-name': 'mappingResponse',
        },
        randomseq: {
          summary: '랜덤 순회 제어 명령',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: '랜덤 순회 명령',
                default: 'randomseq',
                enum: ['randomseq'],
                'x-parser-schema-id': '<anonymous-schema-63>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-62>',
          },
          'x-parser-unique-object-id': 'randomseq',
          'x-parser-message-name': 'randomseq',
        },
        randomseqResponse: {
          summary: '도킹 제어명령 응답 (지원하는 모델만)',
          payload: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: '랜덤 순회 명령',
                default: 'randomseq',
                enum: ['randomseq'],
                'x-parser-schema-id': '<anonymous-schema-65>',
              },
              result: {
                type: 'string',
                description: '랜덤 순회 명령 응답',
                default: 'accept',
                enum: ['accept', 'reject', 'success', 'fail'],
                'x-parser-schema-id': '<anonymous-schema-66>',
              },
              message: {
                type: 'string',
                description: 'result == reject, fail 일때 사유',
                default: '',
                'x-parser-schema-id': '<anonymous-schema-67>',
              },
            },
            'x-parser-schema-id': '<anonymous-schema-64>',
          },
          'x-parser-unique-object-id': 'randomseqResponse',
          'x-parser-message-name': 'randomseqResponse',
        },
        status: {
          summary: 'SLAMNAV2가 송신하는 로봇 상태정보 (2HZ)',
          payload: {
            type: 'object',
            description: 'SLAMNAV2가 송신하는 로봇 기타 상태 값(2Hz)',
            properties: {
              imu: {
                type: 'object',
                description: 'IMU, GYR 센서 값',
                properties: {
                  acc_x: {
                    type: 'string',
                    default: '0.000',
                    description: 'string 형식이지만 float 값',
                    'x-parser-schema-id': '<anonymous-schema-69>',
                  },
                  acc_y: {
                    type: 'string',
                    default: '0.000',
                    description: 'string 형식이지만 float 값',
                    'x-parser-schema-id': '<anonymous-schema-70>',
                  },
                  acc_z: {
                    type: 'string',
                    default: '0.000',
                    description: 'string 형식이지만 float 값',
                    'x-parser-schema-id': '<anonymous-schema-71>',
                  },
                  gyr_x: {
                    type: 'string',
                    default: '0.000',
                    description: 'string 형식이지만 float 값',
                    'x-parser-schema-id': '<anonymous-schema-72>',
                  },
                  gyr_y: {
                    type: 'string',
                    default: '0.000',
                    description: 'string 형식이지만 float 값',
                    'x-parser-schema-id': '<anonymous-schema-73>',
                  },
                  gyr_z: {
                    type: 'string',
                    default: '0.000',
                    description: 'string 형식이지만 float 값',
                    'x-parser-schema-id': '<anonymous-schema-74>',
                  },
                  imu_rx: {
                    type: 'string',
                    default: '0.000',
                    description: 'string 형식이지만 float 값',
                    'x-parser-schema-id': '<anonymous-schema-75>',
                  },
                  imu_ry: {
                    type: 'string',
                    default: '0.000',
                    description: 'string 형식이지만 float 값',
                    'x-parser-schema-id': '<anonymous-schema-76>',
                  },
                  imu_rz: {
                    type: 'string',
                    default: '0.000',
                    description: 'string 형식이지만 float 값',
                    'x-parser-schema-id': '<anonymous-schema-77>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-68>',
              },
              lidar: {
                type: 'array',
                description: '라이다 연결상태, 정보',
                items: {
                  type: 'object',
                  properties: {
                    connection: {
                      type: 'string',
                      default: 'false',
                      description: '라이다 연결상태',
                      'x-parser-schema-id': '<anonymous-schema-80>',
                    },
                    port: {
                      type: 'string',
                      default: 'LAN',
                      description: '라이다 연결포트',
                      'x-parser-schema-id': '<anonymous-schema-81>',
                    },
                    serialnumber: {
                      type: 'string',
                      default: 'not yet',
                      description: '라이다 시리얼넘버',
                      'x-parser-schema-id': '<anonymous-schema-82>',
                    },
                  },
                  'x-parser-schema-id': '<anonymous-schema-79>',
                },
                'x-parser-schema-id': '<anonymous-schema-78>',
              },
              motor: {
                type: 'array',
                description: '모터 연결상태, 정보',
                items: {
                  type: 'object',
                  properties: {
                    connection: {
                      type: 'string',
                      default: 'false',
                      description: '모터 연결상태',
                      'x-parser-schema-id': '<anonymous-schema-85>',
                    },
                    current: {
                      type: 'string',
                      default: '0.000',
                      description: '모터 전류',
                      'x-parser-schema-id': '<anonymous-schema-86>',
                    },
                    status: {
                      type: 'string',
                      default: '0',
                      description:
                        '모터 상태. 각 비트(8bit) 당 상태값을 나타냄.',
                      'x-parser-schema-id': '<anonymous-schema-87>',
                    },
                    temp: {
                      type: 'string',
                      default: '0.000',
                      description: '모터 온도',
                      'x-parser-schema-id': '<anonymous-schema-88>',
                    },
                  },
                  'x-parser-schema-id': '<anonymous-schema-84>',
                },
                'x-parser-schema-id': '<anonymous-schema-83>',
              },
              condition: {
                type: 'object',
                description: '위치초기화 상태',
                properties: {
                  inlier_error: {
                    type: 'string',
                    description: '위치 에러',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-90>',
                  },
                  inlier_ratio: {
                    type: 'string',
                    description: '위치 정확도',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-91>',
                  },
                  mapping_error: {
                    type: 'string',
                    description: '매핑 에러율',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-92>',
                  },
                  mapping_ratio: {
                    type: 'string',
                    description: '매핑 정확도',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-93>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-89>',
              },
              robot_state: {
                type: 'object',
                description: '로봇 충전,도킹,파워,위치초기화 상태',
                properties: {
                  charge: {
                    type: 'string',
                    description:
                      '충전 상태 (SRV는 none, ready(충전 중) 값만 존재)',
                    default: 'none',
                    enum: [
                      'none',
                      'ready',
                      'battery_on',
                      'charging',
                      'finish',
                      'fail',
                    ],
                    'x-parser-schema-id': '<anonymous-schema-95>',
                  },
                  dock: {
                    type: 'string',
                    description: '도킹 상태',
                    default: 'false',
                    enum: [true, false],
                    'x-parser-schema-id': '<anonymous-schema-96>',
                  },
                  emo: {
                    type: 'string',
                    description: '비상전원스위치 상태',
                    default: 'false',
                    enum: [true, false],
                    'x-parser-schema-id': '<anonymous-schema-97>',
                  },
                  localization: {
                    type: 'string',
                    description: '위치초기화 상태',
                    default: 'none',
                    enum: ['none', 'good', 'fail'],
                    'x-parser-schema-id': '<anonymous-schema-98>',
                  },
                  power: {
                    type: 'string',
                    description: '전원 상태',
                    default: 'false',
                    enum: [true, false],
                    'x-parser-schema-id': '<anonymous-schema-99>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-94>',
              },
              power: {
                type: 'object',
                description: '전원 상태',
                properties: {
                  bat_current: {
                    type: 'string',
                    description: '배터리 전류',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-101>',
                  },
                  bat_in: {
                    type: 'string',
                    description: '배터리 입력',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-102>',
                  },
                  bat_out: {
                    type: 'string',
                    description: '배터리 출력',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-103>',
                  },
                  bat_percent: {
                    type: 'string',
                    description: '배터리 현재값(%)',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-104>',
                  },
                  charge_current: {
                    type: 'string',
                    description: '충전 전류',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-105>',
                  },
                  contact_voltage: {
                    type: 'string',
                    description: '충전 접촉 전압',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-106>',
                  },
                  power: {
                    type: 'string',
                    description: '전력',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-107>',
                  },
                  total_power: {
                    type: 'string',
                    description: '누적 전력',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-108>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-100>',
              },
              setting: {
                type: 'object',
                description: '세팅값',
                properties: {
                  platform_type: {
                    type: 'string',
                    description: '플랫폼 타입',
                    default: 'SRV',
                    'x-parser-schema-id': '<anonymous-schema-110>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-109>',
              },
              map: {
                type: 'object',
                description: '맵 상태',
                properties: {
                  map_name: {
                    type: 'string',
                    description: '맵 이름',
                    default: '',
                    'x-parser-schema-id': '<anonymous-schema-112>',
                  },
                  map_status: {
                    type: 'string',
                    description: '맵 로딩 상태',
                    default: 'none',
                    enum: ['none', 'loading', 'loaded'],
                    'x-parser-schema-id': '<anonymous-schema-113>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-111>',
              },
              time: {
                type: 'string',
                default: '21352345124124',
                description: '발송 시간',
                'x-parser-schema-id': '<anonymous-schema-114>',
              },
            },
            'x-parser-schema-id': 'status',
          },
          'x-parser-unique-object-id': 'status',
          'x-parser-message-name': 'status',
        },
        moveStatus: {
          summary: 'SLAMNAV2가 송신하는 로봇 이동 상태정보 (10HZ)',
          payload: {
            type: 'object',
            description: 'SLAMNAV2가 송신하는 로봇 이동 상태 값(10Hz)',
            properties: {
              move_state: {
                type: 'object',
                description: '이동 상태',
                properties: {
                  auto_move: {
                    type: 'string',
                    description: '자율주행 이동 상태',
                    default: 'not ready',
                    enum: [
                      'not ready',
                      'stop',
                      'move',
                      'pause',
                      'error',
                      'vir',
                    ],
                    'x-parser-schema-id': '<anonymous-schema-116>',
                  },
                  dock_move: {
                    type: 'string',
                    description: '도킹주행 이동 상태(미사용)',
                    default: 'none',
                    'x-parser-schema-id': '<anonymous-schema-117>',
                  },
                  jog_move: {
                    type: 'string',
                    description: '조이스틱주행 이동 상태(미사용)',
                    default: 'none',
                    'x-parser-schema-id': '<anonymous-schema-118>',
                  },
                  obs: {
                    type: 'string',
                    description: '주행 중 장애물 상태',
                    default: 'none',
                    enum: ['none', 'far', 'near', 'vir'],
                    'x-parser-schema-id': '<anonymous-schema-119>',
                  },
                  path: {
                    type: 'string',
                    description: '주행 경로 요청 상태',
                    default: 'none',
                    enum: ['none', 'req_path', 'recv_path'],
                    'x-parser-schema-id': '<anonymous-schema-120>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-115>',
              },
              pose: {
                type: 'object',
                description: '로봇 글로벌 좌표 (위치초기화 된 상태에서 유의미)',
                properties: {
                  x: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-122>',
                  },
                  y: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-123>',
                  },
                  rz: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-124>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-121>',
              },
              vel: {
                type: 'object',
                description: '로봇 속도',
                properties: {
                  vx: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-126>',
                  },
                  vy: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-127>',
                  },
                  wz: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-128>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-125>',
              },
              goal_node: {
                type: 'object',
                description: '주행 목표지점 정보 및 상태',
                properties: {
                  id: {
                    type: 'string',
                    description: '목표지점(goal) 노드 ID',
                    default: '',
                    'x-parser-schema-id': '<anonymous-schema-130>',
                  },
                  name: {
                    type: 'string',
                    description: '목표지점(goal) 노드 이름',
                    default: '',
                    'x-parser-schema-id': '<anonymous-schema-131>',
                  },
                  state: {
                    type: 'string',
                    description: '목표지점(goal) 이동 상태',
                    default: 'none',
                    enum: [
                      'none',
                      'move',
                      'complete',
                      'fail',
                      'obstacle',
                      'cancel',
                    ],
                    'x-parser-schema-id': '<anonymous-schema-132>',
                  },
                  x: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-133>',
                  },
                  y: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-134>',
                  },
                  rz: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-135>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-129>',
              },
              cur_node: {
                type: 'object',
                description: '주행 중 현재 위치한 노드 정보',
                properties: {
                  id: {
                    type: 'string',
                    description: '현재지점(cur) 노드 ID',
                    default: '',
                    'x-parser-schema-id': '<anonymous-schema-137>',
                  },
                  name: {
                    type: 'string',
                    description: '현재지점(cur) 노드 이름',
                    default: '',
                    'x-parser-schema-id': '<anonymous-schema-138>',
                  },
                  x: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-139>',
                  },
                  y: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-140>',
                  },
                  rz: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-141>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-136>',
              },
              time: {
                type: 'string',
                default: '21352345124124',
                description: '발송 시간',
                'x-parser-schema-id': '<anonymous-schema-142>',
              },
            },
            'x-parser-schema-id': 'moveStatus',
          },
          'x-parser-unique-object-id': 'moveStatus',
          'x-parser-message-name': 'moveStatus',
        },
        programStatus: {
          summary: 'RRS에 연결된 프로그램 상태 정보 (1HZ)',
          payload: {
            type: 'object',
            description: 'SLAMNAV, TASKMAN 연결 상태',
            properties: {
              slam: {
                type: 'object',
                description: 'SLAMNAV',
                properties: {
                  connection: {
                    type: 'string',
                    default: 'false',
                    'x-parser-schema-id': '<anonymous-schema-144>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-143>',
              },
              task: {
                type: 'object',
                description: 'TASKMAN',
                properties: {
                  connection: {
                    type: 'string',
                    default: 'false',
                    'x-parser-schema-id': '<anonymous-schema-146>',
                  },
                  file: {
                    type: 'string',
                    description: '현재 로드된 파일 이름',
                    default: '',
                    'x-parser-schema-id': '<anonymous-schema-147>',
                  },
                  id: {
                    type: 'number',
                    description: '현재 실행중인 TASK id 위치',
                    default: 0,
                    'x-parser-schema-id': '<anonymous-schema-148>',
                  },
                  running: {
                    type: 'string',
                    description: 'TASK 실행 상태',
                    default: 'false',
                    'x-parser-schema-id': '<anonymous-schema-149>',
                  },
                  variables: {
                    type: 'array',
                    default: [],
                    'x-parser-schema-id': '<anonymous-schema-150>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-145>',
              },
            },
            'x-parser-schema-id': 'programStatus',
          },
          'x-parser-unique-object-id': 'programStatus',
          'x-parser-message-name': 'programStatus',
        },
        localPath: {
          summary: 'SLAMNAV2가 송신하는 로컬경로 (변경될때마다)',
          payload: {
            type: 'array',
            items: {
              type: 'array',
              description: 'SLAMNAV2가 송신하는 로컬 이동경로 좌표 (x, y, rz)',
              default: ['0', '0', '0'],
              'x-parser-schema-id': '<anonymous-schema-151>',
            },
            'x-parser-schema-id': 'localPath',
          },
          'x-parser-unique-object-id': 'localPath',
          'x-parser-message-name': 'localPath',
        },
        globalPath: {
          summary: 'SLAMNAV2가 송신하는 글로벌경로 (변경될때마다)',
          payload: {
            type: 'array',
            items: {
              type: 'array',
              description:
                'SLAMNAV2가 송신하는 글로벌 이동경로 좌표 (x, y, rz)',
              default: ['0', '0', '0'],
              'x-parser-schema-id': '<anonymous-schema-152>',
            },
            'x-parser-schema-id': 'globalPath',
          },
          'x-parser-unique-object-id': 'globalPath',
          'x-parser-message-name': 'globalPath',
        },
        lidarCloud: {
          summary:
            'SLAMNAV2가 송신하는 라이다클라우드와 로봇의 현재 위치 (1HZ)',
          payload: {
            type: 'object',
            description: '라이다 포인트 좌표',
            properties: {
              pose: {
                type: 'object',
                description: '로봇 현재 위치',
                properties: {
                  x: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-154>',
                  },
                  y: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-155>',
                  },
                  rz: {
                    type: 'string',
                    default: '0.000',
                    'x-parser-schema-id': '<anonymous-schema-156>',
                  },
                },
                'x-parser-schema-id': '<anonymous-schema-153>',
              },
              data: {
                type: 'array',
                description:
                  '라이다 위치 (360도 360포인트) 각 요소는 x, y, z, intensity',
                items: {
                  type: 'array',
                  default: ['0', '0', '0', '0'],
                  'x-parser-schema-id': '<anonymous-schema-158>',
                },
                'x-parser-schema-id': '<anonymous-schema-157>',
              },
            },
            'x-parser-schema-id': 'lidarCloud',
          },
          'x-parser-unique-object-id': 'lidarCloud',
          'x-parser-message-name': 'lidarCloud',
        },
        mappingCloud: {
          summary: 'SLAMNAV2가 송신하는 매핑클라우드 (변경될때마다)',
          payload: {
            type: 'array',
            description:
              '매핑 중 클라우드 좌표(추가된 포인트만 송신) 각 요소는 x, y, z, intensity',
            items: {
              type: 'array',
              default: ['0', '0', '0', '0'],
              'x-parser-schema-id': '<anonymous-schema-159>',
            },
            'x-parser-schema-id': 'mappingCloud',
          },
          'x-parser-unique-object-id': 'mappingCloud',
          'x-parser-message-name': 'mappingCloud',
        },
      },
      'x-parser-unique-object-id': 'root',
    },
  },
  operations: {
    moveCommand: {
      action: 'send',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.moveCommand'],
      'x-parser-unique-object-id': 'moveCommand',
    },
    moveResponse: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.moveResponse'],
      'x-parser-unique-object-id': 'moveResponse',
    },
    localization: {
      action: 'send',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.localization'],
      'x-parser-unique-object-id': 'localization',
    },
    localizationResponse: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.localizationResponse'],
      'x-parser-unique-object-id': 'localizationResponse',
    },
    load: {
      action: 'send',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.load'],
      'x-parser-unique-object-id': 'load',
    },
    loadResponse: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.loadResponse'],
      'x-parser-unique-object-id': 'loadResponse',
    },
    dock: {
      action: 'send',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.dock'],
      'x-parser-unique-object-id': 'dock',
    },
    dockResponse: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.dockResponse'],
      'x-parser-unique-object-id': 'dockResponse',
    },
    mapping: {
      action: 'send',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.mapping'],
      'x-parser-unique-object-id': 'mapping',
    },
    mappingResponse: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.mappingResponse'],
      'x-parser-unique-object-id': 'mappingResponse',
    },
    randomseq: {
      action: 'send',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.randomseq'],
      'x-parser-unique-object-id': 'randomseq',
    },
    randomseqResponse: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.randomseqResponse'],
      'x-parser-unique-object-id': 'randomseqResponse',
    },
    motor: {
      action: 'send',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.motor'],
      'x-parser-unique-object-id': 'motor',
    },
    led: {
      action: 'send',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.led'],
      'x-parser-unique-object-id': 'led',
    },
    lidarOnOff: {
      action: 'send',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.lidarOnOff'],
      'x-parser-unique-object-id': 'lidarOnOff',
    },
    pathOnOff: {
      action: 'send',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.pathOnOff'],
      'x-parser-unique-object-id': 'pathOnOff',
    },
    statusListener: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.status'],
      'x-parser-unique-object-id': 'statusListener',
    },
    moveStatusListener: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.moveStatus'],
      'x-parser-unique-object-id': 'moveStatusListener',
    },
    programStatusListener: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.programStatus'],
      'x-parser-unique-object-id': 'programStatusListener',
    },
    localPathListener: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.localPath'],
      'x-parser-unique-object-id': 'localPathListener',
    },
    globalPathListener: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.globalPath'],
      'x-parser-unique-object-id': 'globalPathListener',
    },
    lidarCloudListener: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.lidarCloud'],
      'x-parser-unique-object-id': 'lidarCloudListener',
    },
    mappingCloudListener: {
      action: 'receive',
      channel: '$ref:$.channels.root',
      messages: ['$ref:$.channels.root.messages.mappingCloud'],
      'x-parser-unique-object-id': 'mappingCloudListener',
    },
  },
  components: {
    messages: '$ref:$.channels.root.messages',
    schemas: {
      lidarCloud: '$ref:$.channels.root.messages.lidarCloud.payload',
      mappingCloud: '$ref:$.channels.root.messages.mappingCloud.payload',
      localPath: '$ref:$.channels.root.messages.localPath.payload',
      globalPath: '$ref:$.channels.root.messages.globalPath.payload',
      programStatus: '$ref:$.channels.root.messages.programStatus.payload',
      moveStatus: '$ref:$.channels.root.messages.moveStatus.payload',
      status: '$ref:$.channels.root.messages.status.payload',
    },
  },
  'x-parser-spec-parsed': true,
  'x-parser-api-version': 3,
  'x-parser-spec-stringified': true,
};
const config = {
  show: { sidebar: true },
  sidebar: { showOperations: 'byDefault' },
};
const appRoot = document.getElementById('root');
AsyncApiStandalone.render({ schema, config }, appRoot);
