import { BadRequestException } from '@nestjs/common';
import { contains, ValidationError } from 'class-validator';
import { inspect } from 'util';

export function execptionFactory(errors: ValidationError[]) {
  if (errors === undefined) {
    throw new BadRequestException('input invalid');
  }
  const validationError = { validation: errors.map(e => getGrandChild(e)) };
  throw new BadRequestException({
    message: validationError,
    statusCode: 400,
  });
}
function getGrandChild(e: ValidationError, prefix?: string) {
  const { property, constraints } = e;
  const [message] = constraints ? Object.values(constraints) : [];
  if (e.children.length > 0) {
    return getGrandChild(
      e.children[0],
      prefix ? `${prefix}.${property}` : e.property,
    );
  } else {
    return {
      field: prefix ? `${prefix}.${property}` : e.property,
      message: message,
    };
  }
}
