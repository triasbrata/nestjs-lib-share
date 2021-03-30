import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Hash } from '../hash/hash';

@Injectable()
@ValidatorConstraint({ async: false })
export class DecodeIdValidator implements ValidatorConstraintInterface {
  constructor(private readonly hash: Hash) {}
  validate(value: any): boolean {
    const decoded = this.hash.decode(value) as number[];
    return decoded.length > 0;
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `${validationArguments.property} is not valid id`;
  }
}
export function DecodeId(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DecodeIdValidator,
    });
  };
}
