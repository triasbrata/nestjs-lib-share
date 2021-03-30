import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Hash } from '../hash/hash';

@Injectable()
export class HashIdPipe implements PipeTransform {
  constructor(private readonly hash: Hash) {}
  transform(value: any, metadata: ArgumentMetadata) {
    const vals = this.hash.decode(value);
    return vals;
  }
}
