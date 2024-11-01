"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const router = express.Router();
const filesystem = require("../filesystem");
const fs = require("fs");
const spath = require("../../setting.json");
const logger = require("../log/logger");

router.use(bodyParser.json());
router.use(cors());

router.get("/setting/:type", async (req, res) => {
  const config_path = path.join(
    spath.slam_path,
    "config",
    req.params.type,
    "config.json"
  );
  filesystem
    .readJson(config_path)
    .then(async (data) => {
      const ee = await transformDataToUI(data);
      res.send(ee);
    })
    .catch((error) => {
      logger.error(
        "Get Setting " + req.params.type + " Error : " + config_path
      );
      res.status(500).send(error);
    });
});

async function transformDataToUI(data) {
  if (data != undefined && data != {}) {
    const new_default = {
      ROBOT_SIZE_MAX_X: data.default.ROBOT_SIZE_MAX_X,
      ROBOT_SIZE_MAX_Y: data.default.ROBOT_SIZE_MAX_Y,
      ROBOT_SIZE_MAX_Z: data.default.ROBOT_SIZE_MAX_Z,
      ROBOT_SIZE_MIN_X: data.default.ROBOT_SIZE_MIN_X,
      ROBOT_SIZE_MIN_Y: data.default.ROBOT_SIZE_MIN_Y,
      ROBOT_SIZE_MIN_Z: data.default.ROBOT_SIZE_MIN_Z,
      ROBOT_RADIUS: data.default.ROBOT_RADIUS,
      ROBOT_WHEEL_BASE: data.default.ROBOT_WHEEL_BASE,
      ROBOT_WHEEL_RADIUS: data.default.ROBOT_WHEEL_RADIUS,
      LIDAR_MAX_RANGE: data.default.LIDAR_MAX_RANGE,
      LIDAR_TF_B_X: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[0]
        : 0,
      LIDAR_TF_B_Y: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[1]
        : 0,
      LIDAR_TF_B_Z: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[2]
        : 0,
      LIDAR_TF_B_RX: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[3]
        : 0,
      LIDAR_TF_B_RY: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[4]
        : 0,
      LIDAR_TF_B_RZ: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[5]
        : 0,
      LIDAR_TF_F_X: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[0]
        : 0,
      LIDAR_TF_F_Y: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[1]
        : 0,
      LIDAR_TF_F_Z: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[2]
        : 0,
      LIDAR_TF_F_RX: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[3]
        : 0,
      LIDAR_TF_F_RY: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[4]
        : 0,
      LIDAR_TF_F_RZ: data.default.LIDAR_TF_B
        ? data.default.LIDAR_TF_B.split(",")[5]
        : 0,
    };
    const new_cam = {
      CAM_SERIAL_NUMBER_0: data.cam.CAM_SERIAL_NUMBER_0,
      CAM_SERIAL_NUMBER_1: data.cam.CAM_SERIAL_NUMBER_1,
      CAM_HEIGHT_MIN: data.cam.CAM_HEIGHT_MIN,
      CAM_HEIGHT_MAX: data.cam.CAM_HEIGHT_MAX,
      CAM_TF_0_X: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(",")[0] : 0,
      CAM_TF_0_Y: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(",")[1] : 0,
      CAM_TF_0_Z: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(",")[2] : 0,
      CAM_TF_0_RX: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(",")[3] : 0,
      CAM_TF_0_RY: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(",")[4] : 0,
      CAM_TF_0_RZ: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(",")[5] : 0,
      CAM_TF_1_X: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(",")[0] : 0,
      CAM_TF_1_Y: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(",")[1] : 0,
      CAM_TF_1_Z: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(",")[2] : 0,
      CAM_TF_1_RX: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(",")[3] : 0,
      CAM_TF_1_RY: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(",")[4] : 0,
      CAM_TF_1_RZ: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(",")[5] : 0,
    };
    const newdata = { ...data, default: new_default, cam: new_cam };
    return newdata;
  } else {
    return {};
  }
}
async function transformDataToJson(data) {
  if (data != undefined && data != {}) {
    const lidar_tf_b =
      data.default.LIDAR_TF_B_X +
      "," +
      data.default.LIDAR_TF_B_Y +
      "," +
      data.default.LIDAR_TF_B_Z +
      "," +
      data.default.LIDAR_TF_B_RX +
      "," +
      data.default.LIDAR_TF_B_RY +
      "," +
      data.default.LIDAR_TF_B_RZ;
    const lidar_tf_f =
      data.default.LIDAR_TF_F_X +
      "," +
      data.default.LIDAR_TF_F_Y +
      "," +
      data.default.LIDAR_TF_F_Z +
      "," +
      data.default.LIDAR_TF_F_RX +
      "," +
      data.default.LIDAR_TF_F_RY +
      "," +
      data.default.LIDAR_TF_F_RZ;
    const camera_tf_0 =
      data.cam.CAM_TF_0_X +
      "," +
      data.cam.CAM_TF_0_Y +
      "," +
      data.cam.CAM_TF_0_Z +
      "," +
      data.cam.CAM_TF_0_RX +
      "," +
      data.cam.CAM_TF_0_RY +
      "," +
      data.cam.CAM_TF_0_RZ;
    const camera_tf_1 =
      data.cam.CAM_TF_1_X +
      "," +
      data.cam.CAM_TF_1_Y +
      "," +
      data.cam.CAM_TF_1_Z +
      "," +
      data.cam.CAM_TF_1_RX +
      "," +
      data.cam.CAM_TF_1_RY +
      "," +
      data.cam.CAM_TF_1_RZ;

    const new_default = {
      ROBOT_SIZE_MAX_X: data.default.ROBOT_SIZE_MAX_X,
      ROBOT_SIZE_MAX_Y: data.default.ROBOT_SIZE_MAX_Y,
      ROBOT_SIZE_MAX_Z: data.default.ROBOT_SIZE_MAX_Z,
      ROBOT_SIZE_MIN_X: data.default.ROBOT_SIZE_MIN_X,
      ROBOT_SIZE_MIN_Y: data.default.ROBOT_SIZE_MIN_Y,
      ROBOT_SIZE_MIN_Z: data.default.ROBOT_SIZE_MIN_Z,
      ROBOT_RADIUS: data.default.ROBOT_RADIUS,
      ROBOT_WHEEL_BASE: data.default.ROBOT_WHEEL_BASE,
      ROBOT_WHEEL_RADIUS: data.default.ROBOT_WHEEL_RADIUS,
      LIDAR_MAX_RANGE: data.default.LIDAR_MAX_RANGE,
      LIDAR_TF_B: lidar_tf_b,
      LIDAR_TF_F: lidar_tf_f,
    };
    const new_camera = {
      CAM_SERIAL_NUMBER_0: data.cam.CAM_SERIAL_NUMBER_0,
      CAM_SERIAL_NUMBER_1: data.cam.CAM_SERIAL_NUMBER_1,
      CAM_TF_0: camera_tf_0,
      CAM_TF_1: camera_tf_1,
      CAM_HEIGHT_MIN: data.cam.CAM_HEIGHT_MIN,
      CAM_HEIGHT_MAX: data.cam.CAM_HEIGHT_MAX,
    };
    const newdata = { ...data, default: new_default, cam: new_camera };
    return newdata;
  } else {
    return {};
  }
}
router.post("/setting/:type", async (req, res) => {
  logger.info("Save Setting " + req.params.type);
  const config_path = path.join(
    spath.slam_path,
    "config",
    req.params.type,
    "config.json"
  );
  const newbody = await transformDataToJson(req.body);
  filesystem
    .saveJson(config_path, newbody)
    .then(async (data) => {
      const ee = await transformDataToUI(data);
      res.send(ee);
    })
    .catch((error) => {
      logger.error("Save Setting " + req.params.type + " Error : " + error);
      res.status(500).send(error);
    });
});

router.get("/setting/preset/:type", (req, res) => {
  const config_path = path.join(spath.slam_path, "config", req.params.type);
  filesystem
    .getPresetList(config_path)
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      logger.error(
        "Get Setting Preset List " + req.params.type + " Error : " + error
      );
      res.status(500).send();
    });
});

router.delete("/setting/preset/:type/:id", async (req, res) => {
  if (req.params.id == null || req.params.id == undefined) {
    res.status(400).send();
  } else {
    const filename = "preset_" + req.params.id + ".json";
    logger.info("Delete Setting Preset " + req.params.type + " : " + filename);
    const config_path = path.join(spath.slam_path, "config", req.params.type);
    filesystem
      .deleteFile(config_path + "/" + filename)
      .then(() => {
        filesystem
          .getPresetList(config_path)
          .then((data) => {
            res.send(data);
          })
          .catch((error) => {
            res.send({ error: error, name: filename });
          });
      })
      .catch((error) => {
        logger.error(
          "Delete Setting Preset " +
            req.params.type +
            " Error : " +
            filename +
            ", " +
            error
        );
        res.send({ error: error, name: filename });
      });
  }
});

router.get("/setting/preset/:type/:id", async (req, res) => {
  if (req.params.id == null || req.params.id == undefined) {
    res.status(400).send();
  } else {
    const filename = "preset_" + req.params.id + ".json";
    const config_path = path.join(
      spath.slam_path,
      "config",
      req.params.type,
      filename
    );
    filesystem
      .readJson(config_path)
      .then(async (data) => {
        res.send(data);
      })
      .catch((error) => {
        logger.error(
          "Get Setting Preset " +
            req.params.type +
            " Error : " +
            filename +
            ", " +
            error
        );
        res.send({ ...error, name: filename });
      });
  }
});

router.get("/setting/temp/:type/:id", (req, res) => {
  if (req.params.id == null || req.params.id == undefined) {
    res.status(400).send();
  } else {
    const filename = "preset_" + req.params.id + ".json";
    const config_path = path.join(
      spath.slam_path,
      "config",
      req.params.type,
      filename
    );
    filesystem
      .makeTempPreset(config_path)
      .then(async (data) => {
        res.send(data);
      })
      .catch((error) => {
        logger.error(
          "Get Setting Preset Temp " + " Error : " + filename + ", " + error
        );
        res.status(500).send(error);
      });
  }
});

router.post("/setting/preset/:type/:id", (req, res) => {
  if (req.params.id == null || req.params.id == undefined) {
    res.status(400).send();
  } else {
    const filename = "preset_" + req.params.id + ".json";
    logger.info("Save Setting Preset " + req.params.type + " : " + filename);
    const config_path = path.join(
      spath.slam_path,
      "config",
      req.params.type,
      filename
    );
    filesystem
      .saveJson(config_path, req.body)
      .then(async (data) => {
        res.send(data);
      })
      .catch((error) => {
        logger.error(
          "Save Setting Preset " +
            req.params.type +
            " Error : " +
            filename +
            ", " +
            error
        );
        res.status(500).send(error);
      });
  }
});

module.exports = router;
