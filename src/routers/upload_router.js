const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const router = express.Router();
const axios = require("axios");
const compression = require("compression");
const FormData = require("form-data");
const AdmZip = require("adm-zip");
const bodyParser = require("body-parser");
const { homedir } = require("os");

router.use(bodyParser.json({ limit: "100mb" }));
router.use(bodyParser.urlencoded({ limit: "100mb", extended: false }));
router.use(cors());
router.use(compression());

// Multer 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, homedir + "/upload/"); // 파일이 저장될 디렉토리
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // 원본 파일 이름 그대로 저장
  },
});

const upload = multer({ storage: storage });

function zipFolder(sourceFolderPath, zipFilePath) {
  const zip = new AdmZip();

  function addFilesRecursively(folderPath, zipFolderPath = "") {
    const files = fs.readdirSync(folderPath);

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // 하위 폴더가 있다면 재귀적으로 처리
        addFilesRecursively(filePath, path.join(zipFolderPath, file));
      } else {
        // 파일이라면 압축에 추가
        zip.addLocalFile(filePath, zipFolderPath);
      }
    });
  }

  // 폴더 내 파일 및 하위 폴더를 재귀적으로 압축에 추가
  addFilesRecursively(sourceFolderPath);

  // 압축 파일 생성
  zip.writeZip(zipFilePath);
  console.log(`ZIP 파일 생성 완료: ${zipFilePath}`);
}

function unzipFolder(zipFilePath, extractToPath) {
  try {
    console.log("unzipFolder ", zipFilePath);
    const zip = new AdmZip(zipFilePath);

    // 압축 해제할 경로가 없다면 생성
    if (!fs.existsSync(extractToPath)) {
      fs.mkdirSync(extractToPath, { recursive: true });
    }

    // 압축 해제
    zip.extractAllTo(extractToPath, true); // true는 기존 파일 덮어쓰기를 의미
    console.log(`ZIP 파일 압축 해제 완료: ${extractToPath}`);
  } catch (error) {
    console.error(error);
  }
}

router.post("/upload/map", async (req, res) => {
  console.log("파일 압축 및 전송 준비 중:", req.body);
  const { name, mapNm, userId, token } = req.body;

  console.log("Upload : ", name, mapNm, userId, token);
  const originalFilePath = homedir() + "/maps/" + mapNm;
  const zipFileName = `${name}.zip`;
  const zipFilePath = path.join(homedir(), "maps", zipFileName);
  try {
    if (name == undefined || name == "") {
      res.status(400).send({ message: "parameter missing (name)" });
    } else if (mapNm == undefined || mapNm == "") {
      res.status(400).send({ message: "parameter missing (mapNm)" });
    } else if (userId == undefined || userId == "") {
      res.status(400).send({ message: "parameter missing (userId)" });
    } else if (token == undefined || token == "") {
      res.status(400).send({ message: "parameter missing (token)" });
    } else {
      // ZIP 파일 생성
      const zip = new AdmZip();

      zipFolder(originalFilePath, zipFilePath);

      // ZIP 파일 전송
      const zipStream = fs.createReadStream(zipFilePath);

      const formData = new FormData();
      formData.append("file", zipStream, { filename: zipFileName });
      formData.append("deleteZipAt", "Y");

      const config = {
        headers: {
          "content-type": "multipart/form-data; charset=utf-8",
          authorization: "Bearer " + token,
        },
      };
      const response = await axios.post(
        global.frs_api + "/api/maps/frs-map/upload",
        formData,
        config
      );
      console.log(response.data);
      res.send({ message: "파일 저장 성공" });
    }
  } catch (error) {
    console.error("파일 업로드 중 오류 발생:", error.response.data);
    res.status(error.response.status).json();
  } finally {
    fs.unlink(zipFilePath, (err) => {
      if (err) console.error("임시 ZIP 파일 삭제 실패:", err);
    });
  }
});

// 파일을 요청해서 다운로드하는 엔드포인트
router.post("/download/map", async (req, res) => {
  const { name, user_id, token } = req.body;
  try {
    console.log("Map Download : ", name, user_id, token);

    if (name == undefined || name == "") {
      res.status(400).send({ message: "parameter missing (name)" });
    } else if (user_id == undefined || user_id == "") {
      res.status(400).send({ message: "parameter missing (user_id)" });
    } else if (token == undefined || token == "") {
      res.status(400).send({ message: "parameter missing (token)" });
    } else {
      const response = await axios.get(
        global.frs_api + "/api/maps/frs-map/download",
        {
          responseType: "stream",
          params: { attachmentFileDtlFlNm: name, deleteZipAt: "Y" },
          headers: { authorization: "Bearer " + token },
        }
      );

      const fileStream = fs.createWriteStream(homedir() + "/maps/" + name);
      response.data.pipe(fileStream);

      fileStream.on("finish", () => {
        console.log("file download successfully");

        const zipFilePath = path.join(homedir(), "maps", name);

        const extractToPath = path.join(homedir(), "maps", name.split(".")[0]);
        console.log("Map Download : ", zipFilePath, extractToPath);

        unzipFolder(zipFilePath, extractToPath);

        res.send(extractToPath);

        console.log("압축파일 삭제 : ", homedir() + "/maps/" + name);
        fs.unlink(homedir() + "/maps/" + name, (err) => {
          if (err) console.error("임시 ZIP 파일 삭제 실패:", err);
          console.log("성공");
        });
      });
    }
  } catch (error) {
    console.error("파일 다운로드 중 오류 발생:", error.response.status);
    res.status(error.response.status).send();
  }
});

// 파일을 업로드하고 압축 해제하는 엔드포인트
router.post(
  "/download/map/:map_name",
  upload.single("file"),
  async (req, res) => {
    console.log("파일 압축 및 전송 준비 중:", req.body);
    try {
      console.log("Map Download : ", req.params.map_name, req.file);

      if (req.params.map_name == undefined || req.params.map_name == "") {
        res.status(400).send({ message: "parameter missing (name)" });
      } else {
        const zipFilePath = path.join(homedir(), "upload", req.file.filename);

        const extractToPath = path.join(homedir(), "maps", req.params.map_name);
        console.log("Map Download : ", zipFilePath, extractToPath);

        unzipFolder(zipFilePath, extractToPath);
        res.send(extractToPath);
      }
    } catch (error) {
      console.error("파일 다운로드 중 오류 발생:", error.message);
      res.status(500).json({ message: "파일 다운로드 실패" });
    } finally {
      fs.unlink(homedir() + "/upload/" + req.file.filename, (err) => {
        if (err) console.error("임시 ZIP 파일 삭제 실패:", err);
      });
    }
  }
);
module.exports = router;
