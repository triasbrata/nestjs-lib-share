import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FormatPatternPlaywrightPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if(value?.['fields']){
      const {fields, ...newVal} = value;
      if (Array.isArray(fields) && fields?.length > 0) {
        for (const {type,...field} of fields) {
          newVal[type]['fields'] = [...(newVal[type]['fields'] || []), field];
        }
      }
      return newVal;
    }
    return value
  }
}
