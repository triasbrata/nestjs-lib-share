import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
type PasswordOptions = {
  fieldName?: string;
};
export function Password(
  validationOptions?: ValidationOptions & PasswordOptions,
) {
  return function(object: Object, propertyName: string) {
    let { fieldName, ...options } = validationOptions;
    if (fieldName === undefined || fieldName === null) {
      fieldName = `${propertyName}_retry`;
    }
    registerDecorator({
      name: 'Password',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [fieldName],
      options: {
        ...{
          message: `${propertyName} not match with field ${propertyName} Retry`,
        },
        ...options,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [retryField] = args.constraints;
          const valueRetry = args.object?.[retryField];
          const valid =
            typeof value === 'string' &&
            typeof valueRetry === 'string' &&
            valueRetry === value;
          if (valid) {
            delete args.object?.[retryField];
          }
          return valid; // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}
