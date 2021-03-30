import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnApplicationBootstrap,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
@Injectable()
export class Bcrypt implements OnApplicationBootstrap {
  logger = new Logger(Bcrypt.name);
  salt: string;
  constructor(private readonly configService: ConfigService) {}
  async onApplicationBootstrap() {
    this.salt = this.configService.get<string>('APP_SALT');
    if (!this.salt) {
      this.logger.warn('salt not defined');
    }
  }

  make(password: string): Promise<string> {
    return bcrypt.hash(password, this.salt);
  }

  check(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
