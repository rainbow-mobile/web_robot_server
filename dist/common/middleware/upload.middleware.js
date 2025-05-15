"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.soundMiddleware = exports.uploadMiddleware = void 0;
const multer = require("multer");
const multer_1 = require("multer");
const os_1 = require("os");
const upload = multer({
    storage: (0, multer_1.diskStorage)({
        destination: (0, os_1.homedir)() + '/upload/',
        filename: (req, file, callback) => {
            callback(null, `${file.originalname}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
});
const upload_sound = multer({
    storage: (0, multer_1.diskStorage)({
        destination: (0, os_1.homedir)() + '/sounds/',
        filename: (req, file, callback) => {
            callback(null, `${file.originalname}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
});
exports.uploadMiddleware = upload.single('file');
exports.soundMiddleware = upload_sound.single('file');
//# sourceMappingURL=upload.middleware.js.map