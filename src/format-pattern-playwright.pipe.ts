import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { inspect } from 'util';

@Injectable()
export class FormatPatternPlaywrightPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if(value?.['fields']){
      const {fields, ...newVal} = value;
      if (Array.isArray(fields) && fields?.length > 0) {
        for (const {type,...field} of fields) {
          if (!Array.isArray(field.pipes)){
            field.pipes = [];
          }
          newVal[type]['fields'] = [...(newVal[type]['fields'] || []), field];
        }
      }
      newVal.useURL = newVal.useURL === 'true';
      return newVal;
    }
    return value
  }
}
