"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsTimestamp = IsTimestamp;
const class_validator_1 = require("class-validator");
function IsTimestamp(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isTimestamp',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (typeof value !== 'number')
                        return false;
                    const minTimestamp = 0;
                    const maxTimestamp = 4102444800000;
                    return value >= minTimestamp && value <= maxTimestamp;
                },
                defaultMessage(args) {
                    return `${args.property} must be a valid timestamp`;
                },
            },
        });
    };
}
//# sourceMappingURL=validation.util.js.map