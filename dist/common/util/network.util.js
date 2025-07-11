"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMacAddresses = getMacAddresses;
exports.stringifyAllValues = stringifyAllValues;
const os = require("os");
function getMacAddresses() {
    const networkInterfaces = os.networkInterfaces();
    const macAddresses = [];
    for (const [interfaceName, interfaces] of Object.entries(networkInterfaces)) {
        interfaces.forEach((iface) => {
            if (!iface.internal && iface.mac) {
                macAddresses.push({
                    interface: interfaceName,
                    mac: iface.mac,
                });
            }
        });
    }
    return macAddresses;
}
function stringifyAllValues(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            stringifyAllValues(obj[key]);
        }
        else {
            obj[key] = String(obj[key]);
        }
    }
    return obj;
}
module.exports = {
    getMacAddresses: getMacAddresses,
    stringifyAllValues: stringifyAllValues,
};
