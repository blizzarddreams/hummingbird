import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export const IsNotEmptyString = (
  // property: string,
  validationOptions?: ValidationOptions,
) => {
  return (object: Record<string, any>, propertyName: string): void => {
    registerDecorator({
      name: "isNotEmptyString",
      target: object.constructor,
      propertyName,
      constraints: [],
      options: { message: "Text must not be blank." } as ValidationOptions,
      validator: {
        validate(value: string, args: ValidationArguments): boolean {
          return value.trim().length > 0;
        },
      },
    });
  };
};
