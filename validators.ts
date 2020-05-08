import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export const isNotEmptyString = (
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
          // const [relatedPropertyName] = args.constraints;
          //const relatedValue = (args.object as any)[relatedPropertyName];
          return value.trim().length > 0;
        },
      },
    });
  };
};
