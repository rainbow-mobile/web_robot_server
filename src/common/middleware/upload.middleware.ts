import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';
import { diskStorage } from 'multer';

// multer 설정
const upload = multer({
  storage: diskStorage({
    destination: '/data/upload/', // 파일 저장 폴더
    filename: (req, file, callback) => {
      callback(null, `${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 파일 크기 제한 (10MB)
});

// multer 설정
const upload_sound = multer({
  storage: diskStorage({
    destination: '/data/sounds/', // 파일 저장 폴더
    filename: (req, file, callback) => {
      callback(null, `${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 파일 크기 제한 (10MB)
});

// 미들웨어로 export
export const uploadMiddleware = upload.single('file'); // 단일 파일 처리
export const soundMiddleware = upload_sound.single('file'); // 단일 파일 처리
