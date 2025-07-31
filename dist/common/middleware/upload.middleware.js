"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.soundMiddleware = exports.uploadMiddleware = void 0;
const multer = require("multer");
const multer_1 = require("multer");
const path_config_1 = require("../../modules/config/path.config");
const DATA_BASE_PATH = (0, path_config_1.getDataBasePath)();
const upload = multer({
    storage: (0, multer_1.diskStorage)({
        destination: DATA_BASE_PATH + '/upload/',
        filename: (req, file, callback) => {
            callback(null, `${file.originalname}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
});
const upload_sound = multer({
    storage: (0, multer_1.diskStorage)({
        destination: DATA_BASE_PATH + '/sounds/',
        filename: (req, file, callback) => {
            callback(null, `${file.originalname}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
});
exports.uploadMiddleware = upload.single('file');
exports.soundMiddleware = upload_sound.single('file');
//# sourceMappingURL=upload.middleware.js.map