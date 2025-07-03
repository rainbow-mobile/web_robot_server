import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Unix timestamp 검증 데코레이터
 * 밀리초 단위의 타임스탬프를 검증합니다 (1970년 ~ 2100년)
 */
export function IsTimestamp(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTimestamp',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'number') return false;

          const minTimestamp = 0;
          const maxTimestamp = 4102444800000;
          return value >= minTimestamp && value <= maxTimestamp;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid timestamp`;
        },
      },
    });
  };
}
