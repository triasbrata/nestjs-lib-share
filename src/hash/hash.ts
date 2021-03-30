import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Hashids = require('hashids/cjs');
@Injectable()
export class Hash {
  hashID: typeof Hashids;
  constructor(cnf: ConfigService) {
    const salt = cnf.get('HASH_SALT', 'th!5isMys@lt');
    this.hashID = new Hashids(salt, 10);
  }
  encode(...nums: number[]) {
    return this.hashID.encode(...nums);
  }
  generateString(str: string) {
    return this.hashID.encodeHex(str);
  }
  decode(str: string) {
    return this.hashID.decode(str);
  }
}
