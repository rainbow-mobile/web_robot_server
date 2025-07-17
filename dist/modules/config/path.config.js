"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataBasePath = void 0;
const os_1 = require("os");
const path_1 = require("path");
const getDataBasePath = () => {
    const os = (0, os_1.platform)();
    if (os === 'win32') {
        return 'C:/data';
    }
    else if (os === 'darwin') {
        return (0, path_1.join)((0, os_1.homedir)(), 'Documents/rainbow-robotics/data');
    }
    else {
        return '/data';
    }
};
exports.getDataBasePath = getDataBasePath;
//# sourceMappingURL=path.config.js.map