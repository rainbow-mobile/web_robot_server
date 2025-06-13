"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralOperationStatus = exports.GeneralScope = exports.GeneralStatus = exports.GeneralLogType = exports.TorsoOperationName = exports.ManipulatoreOperationName = exports.VehicleOperationName = exports.GeneralOperationName = exports.AmrLogType = exports.ManipulatorType = exports.FormType = void 0;
var FormType;
(function (FormType) {
    FormType["MANIPULATOR"] = "manipulator";
    FormType["TORSO"] = "torso";
    FormType["AMR"] = "amr";
})(FormType || (exports.FormType = FormType = {}));
var ManipulatorType;
(function (ManipulatorType) {
    ManipulatorType["LEFT"] = "left";
    ManipulatorType["RIGHT"] = "right";
})(ManipulatorType || (exports.ManipulatorType = ManipulatorType = {}));
var AmrLogType;
(function (AmrLogType) {
    AmrLogType["VELOCITY"] = "velocity";
    AmrLogType["OBSTACLE"] = "obstacle";
    AmrLogType["DOCKING_PRECISION"] = "docking_precision";
    AmrLogType["MOVING_PRECISION"] = "moving_precision";
})(AmrLogType || (exports.AmrLogType = AmrLogType = {}));
var GeneralOperationName;
(function (GeneralOperationName) {
    GeneralOperationName["PROGRAM_START"] = "PROGRAM_START";
    GeneralOperationName["PROGRAM_END"] = "PROGRAM_END";
    GeneralOperationName["AUTORUN_START"] = "AUTORUN_START";
    GeneralOperationName["AUTORUN_END"] = "AUTORUN_END";
    GeneralOperationName["LOT_START"] = "LOT_START";
    GeneralOperationName["LOT_END"] = "LOT_END";
    GeneralOperationName["LOT_SUMMARY"] = "LOT_SUmmARY";
    GeneralOperationName["BTN_CLICK"] = "BTN_CLICK";
    GeneralOperationName["USER_LOGIN"] = "USER_LOGIN";
    GeneralOperationName["PARAMETER_CHANGE"] = "PARAMETER_CHANGE";
})(GeneralOperationName || (exports.GeneralOperationName = GeneralOperationName = {}));
var VehicleOperationName;
(function (VehicleOperationName) {
    VehicleOperationName["AMR_SERVO_OFF"] = "AMR_SERVO_OFF";
    VehicleOperationName["MOVE"] = "MOVE";
    VehicleOperationName["READY"] = "READY";
})(VehicleOperationName || (exports.VehicleOperationName = VehicleOperationName = {}));
var ManipulatoreOperationName;
(function (ManipulatoreOperationName) {
    ManipulatoreOperationName["MOVE"] = "MOVE";
    ManipulatoreOperationName["READY"] = "READY";
})(ManipulatoreOperationName || (exports.ManipulatoreOperationName = ManipulatoreOperationName = {}));
var TorsoOperationName;
(function (TorsoOperationName) {
    TorsoOperationName["MOVE"] = "MOVE";
    TorsoOperationName["READY"] = "READY";
})(TorsoOperationName || (exports.TorsoOperationName = TorsoOperationName = {}));
var GeneralLogType;
(function (GeneralLogType) {
    GeneralLogType["AUTO"] = "A";
    GeneralLogType["MANUAL"] = "M";
})(GeneralLogType || (exports.GeneralLogType = GeneralLogType = {}));
var GeneralStatus;
(function (GeneralStatus) {
    GeneralStatus["RUN"] = "RUN";
    GeneralStatus["STOP"] = "STOP";
    GeneralStatus["IDLE"] = "IDLE";
    GeneralStatus["ERROR"] = "ERROR";
})(GeneralStatus || (exports.GeneralStatus = GeneralStatus = {}));
var GeneralScope;
(function (GeneralScope) {
    GeneralScope["EVENT"] = "EVENT";
    GeneralScope["VEHICLE"] = "Vehicle";
    GeneralScope["MANIPULATOR"] = "Manipulator";
    GeneralScope["TORSO"] = "Torso";
    GeneralScope["ALARM"] = "ALARM";
})(GeneralScope || (exports.GeneralScope = GeneralScope = {}));
var GeneralOperationStatus;
(function (GeneralOperationStatus) {
    GeneralOperationStatus["START"] = "START";
    GeneralOperationStatus["END"] = "END";
    GeneralOperationStatus["SET"] = "SET";
})(GeneralOperationStatus || (exports.GeneralOperationStatus = GeneralOperationStatus = {}));
//# sourceMappingURL=equipment.enum.js.map