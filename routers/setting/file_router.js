"use strict"

const express = require("express");
const bodyParser = require('body-parser');
const path = require("path")
const cors = require("cors");
const multer = require('multer');
const router = express.Router();
const filesystem = require("../../src/filesystem");
const fs = require('fs');
const spath = require('../../setting.json');

router.use(bodyParser.json());
router.use(cors());

const getDirectoryTree = (dirPath) => {
    const dirents = fs.readdirSync(dirPath, { withFileTypes: true });
    const children = dirents.map((dirent) => {
        const res = path.resolve(dirPath, dirent.name);
        return dirent.isDirectory() ? getDirectoryTree(res) : { path: res, name: dirent.name, isDirectory: false };
    });
    return {
        path: dirPath,
        name: path.basename(dirPath),
        isDirectory: true,
        children
    };
};

// router.get('/local', (req, res) => {
//     console.log("get local home");
//     const directoryPath = spath.home_path; // 이 경로를 PC의 경로로 설정
//     const directoryTree = getDirectoryTree(directoryPath);
//     console.log(directoryTree);
//     res.json(directoryTree);
// });

module.exports = router;