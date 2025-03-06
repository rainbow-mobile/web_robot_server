import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import httpLogger from '@common/logger/http.logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import * as fs from 'fs';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { DateUtil } from '@common/util/date.util';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';

@Injectable()
export class SSHService {
  constructor(private readonly socketGateway: SocketGateway) {}
  
}
