"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const router = express.Router();
const filesystem = require("../filesystem");
const fs = require("fs");
const compression = require("compression");
const socket = require("../socket/server");
const logger = require("../log/logger");

const home_path = "/home/rainbow";
router.use(bodyParser.json({ limit: "100mb" }));
router.use(bodyParser.urlencoded({ limit: "100mb", extended: false }));
router.use(cors());
router.use(compression());

const map_dir = path.join(home_path, "maps");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, map_dir);
  },
  filename: (req, file, cb) => {
    const encodedFilename = Buffer.from(file.originalname, "ascii").toString(
      "utf8"
    );
    cb(null, encodedFilename);
  },
});
function getCloud(name) {
  return path.join(home_path, "maps", name, "cloud.csv").toString();
}
function getTopo(name) {
  return path.join(home_path, "maps", name, "topo.json").toString();
}

// app.post("/update/map", upload.single("file"), (req, res) => {
//   console.log("파일 업로드 성공:", req.file);

//   // 파일 저장 위치 확인
//   const tempPath = req.file.path;
//   const targetPath = path.join(__dirname, "uploads", req.file.originalname);

//   // 파일 이름 변경 및 이동
//   fs.rename(tempPath, targetPath, (err) => {
//     if (err) {
//       return res.status(500).json({ message: "파일 저장 실패" });
//     }
//     res.status(200).json({ message: "파일 업로드 성공!" });
//   });
// });

//매핑 시작 요청
router.get("/mapping/start", async (req, res) => {
  const time = new Date().getTime();
  socket
    .Mapping({
      command: "start",
      time: time,
    })
    .then((data) => {
      // console.log("startmapping get : ",data);
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
      res.send("startmapping failed");
    });
});

//매핑 종료 요청
router.get("/mapping/stop", async (req, res) => {
  const time = new Date().getTime();
  socket
    .Mapping({
      command: "stop",
      time: time,
    })
    .then((data) => {
      // console.log("stopmapping get : ",data);
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
      res.send("stopmapping failed");
    });
});

//매핑 종료(저장) 요청
router.get("/mapping/save/:name", async (req, res) => {
  const time = new Date().getTime();
  socket
    .Mapping({
      command: "save",
      name: req.params.name,
      time: time,
    })
    .then((data) => {
      console.log("savemapping get : ", data);
      res.send(data);

      //리로드 요청
      socket.MapLoad(req.params.name);
    })
    .catch((err) => {
      console.error(err);
      res.send("savemapping failed");
    });
});

router.get("/mapping/reload", (req, res) => {
  const time = new Date().getTime();
  socket
    .emitCommand("mapping", {
      command: "reload",
      time: time,
    })
    .then(() => {
      res.send();
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

//맵 cloud.csv 요청
router.get("/map/cloud/:map_name", (req, res) => {
  console.log("Cloud get");
  const path = getCloud(req.params.map_name);
  filesystem.existFile(path, (err, fd) => {
    if (err) {
      res.sendStatus(404);
    } else {
      filesystem
        .readCsv(path)
        .then((data) => {
          res.send(data);
        })
        .catch((error) => {
          logger.error(
            "Get Cloud " + req.params.map_name + " Error : " + error
          );
          res.status(500).send(error);
        });
    }
  });
});

//맵 cloud.csv 저장
router.post("/map/cloud/:map_name", (req, res) => {
  try {
    logger.info("Save Cloud " + req.params.map_name);
    const path = getCloud(req.params.map_name);

    if (Array.isArray(req.body)) {
      //backup
      filesystem.existFile(path, (err, fd) => {
        if (err) {
          filesystem
            .saveCsv(path, req.body)
            .then((data) => {
              res.send({ ...data, name: req.params.map_name });
            })
            .catch((error) => {
              logger.error(
                "Save Cloud " + req.params.map_name + " Error : " + error
              );
              res.send({ ...error, name: req.params.map_name });
            });
        } else {
          filesystem
            .copyFile(path)
            .then(() => {
              filesystem
                .saveCsv(path, req.body)
                .then((data) => {
                  res.send({ ...data, name: req.params.map_name });
                  socket.MapLoad(req.params.map_name);
                })
                .catch((error) => {
                  logger.error(
                    "Save Cloud " + req.params.map_name + " Error : " + error
                  );
                  res.send({ ...error, name: req.params.map_name });
                });
            })
            .catch((error) => {
              filesystem
                .saveCsv(path, req.body)
                .then((data) => {
                  res.send({ ...data, name: req.params.map_name });
                })
                .catch((error) => {
                  logger.error(
                    "Save Cloud " + req.params.map_name + " Error : " + error
                  );
                  res.send({ ...error, name: req.params.map_name });
                });
            });
        }
      });
    } else {
      logger.error(
        "Save Cloud " + req.params.map_name + " Error : Data is not array "
      );
      res.sendStatus(400);
    }
  } catch (e) {
    logger.error("Cloud Save Error : ", e);
    res.sendStatus(500);
  }
});

//맵 topo.json 요청
router.get("/map/topo/:map_name", (req, res) => {
  const path = getTopo(req.params.map_name);
  filesystem.existFile(path, (err, fd) => {
    if (err) {
      res.sendStatus(404);
    } else {
      filesystem
        .readJson(path)
        .then((data) => {
          res.send(data);
        })
        .catch((error) => {
          logger.error("Get Topo " + req.params.map_name + " Error : " + error);
          res.status(500).send(error);
        });
    }
  });
});

//맵 topo.json 저장
router.post("/map/topo/:map_name", (req, res) => {
  try {
    logger.info("Save Topo " + req.params.map_name);
    const path = getTopo(req.params.map_name);

    if (req.body.length > 0) {
      //backup
      filesystem.existFile(path, (err, fd) => {
        if (err) {
          filesystem
            .saveFile(path, req.body)
            .then((data) => {
              res.send(data);
            })
            .catch((error) => {
              logger.error(
                "Save Topo " + req.params.map_name + " Error : " + error
              );
              res.status(500).send(error);
            });
        } else {
          filesystem
            .copyFile(path)
            .then(() => {
              filesystem
                .saveFile(path, req.body)
                .then((data) => {
                  res.send(data);
                  socket.MapLoad(req.params.map_name);
                })
                .catch((error) => {
                  logger.error(
                    "Save Topo " + req.params.map_name + " Error : " + error
                  );
                  res.status(500).send(error);
                });
            })
            .catch((error) => {
              filesystem
                .saveFile(path, req.body)
                .then((data) => {
                  res.send(data);
                })
                .catch((error) => {
                  logger.error(
                    "Save Topo " + req.params.map_name + " Error : " + error
                  );
                  res.status(500).send(error);
                });
            });
        }
      });
    } else {
      logger.error(
        "Save Topo " + req.params.map_name + " Error : Data length <= 0"
      );
      res.sendStatus(400);
    }
  } catch (e) {
    logger.error("TOPO Save Error : " + e);
    res.sendStatus(500);
  }
});

//현재 맵 반환
router.get("/map/current", (req, res) => {
  filesystem
    .readJson(home_path + "/config.json")
    .then((data) => {
      res.send(data.setting.MAP_NAME);
    })
    .catch((error) => {
      logger.error("Get Current Map Error : " + error);
      res.sendStatus(500);
    });
});

//현재 맵 로드
router.post("/map/current", (req, res) => {
  const time = new Date().getTime();
  logger.info("Load Map : " + req.body.name);
  socket
    .MapLoad(req.body.name)
    .then((data) => {
      logger.info("Load Map Success: " + req.body.name);
      res.send(data);
    })
    .catch((error) => {
      logger.info("Load Map Error : " + error);
      res.send(error);
    });
});

//맵 업로드
router.post("/map/upload/:map_name", (req, res) => {
  logger.info("UpLoad Map : " + req.params.map_name);
});

//GOAL 목록 반환
router.get("/map/goal/:map_name", (req, res) => {
  const path = getTopo(req.params.map_name);
  filesystem.existFile(path, (err, fd) => {
    if (err) {
      res.sendStatus(404);
    } else {
      filesystem
        .readJson(path)
        .then((data) => {
          let goals = [];
          data.map((node) => {
            if (node.type == "GOAL" || node.type == "INIT") {
              goals.push({ id: node.id, name: node.name });
            }
          });
          res.send(goals);
        })
        .catch((error) => {
          logger.error(
            "Get Goal List " + req.params.map_name + " Error : " + error
          );
          res.status(500).send(error);
        });
    }
  });
});
// const uploadMiddleware = upload.single('file');
// router.post('/savemap/:name/:file',uploadMiddleware, (req,res) => {
//     console.log("SAVEMAP : ",req.params.file);
//     const _path = path.join(map_path,req.params.name);
//     let filepath = path.join(_path,req.params.file);
//     try{
//         const pngfile = req.file;
//         if(!pngfile){
//             console.log("file empty");
//             res.sendStatus(400);
//             return;
//         }
//         res.send("success");
//     }catch(err){
//         if(err instanceof multer.MulterError){
//             console.log("multer error : ",err.code);
//             res.sendStatus(500);
//         }else{
//             console.log("errrror : ",err);
//             res.sendStatus(500);
//         }
//     }
// });

router.get("/map/list", (req, res) => {
  filesystem
    .getMapTree(home_path + "/maps")
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      logger.error("Get Map List Error : " + error);
      res.status(500).send();
    });
});

module.exports = router;
