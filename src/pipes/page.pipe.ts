import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PagePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const val = Number(value);
    if (isNaN(val)) {
      return 1;
    }
    return val || 1;
  }
}
