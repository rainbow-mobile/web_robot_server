"use strict";

const express = require("express");
const bodyParser = require("body-parser");
// const ini = require('ini');
const path = require("path");
const cors = require("cors");
const logger = require("../log/logger");
const multer = require("multer");
const os = require("os");
const router = express.Router();
const filesystem = require("../filesystem");
const fs = require("fs");
const compression = require("compression");
const socket = require("../socket/server");
const parser = require("../task/parser");
const spath = require("../../setting.json");
const home_path = "/home/rainbow";

router.use(bodyParser.json());
router.use(cors());
router.use(compression());

// router.get("/task", (req, res) => {
//   parser
//     .list(spath.task_path + "/work")
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.sendStatus(500).send();
//     });
// });

router.get("/task/file", (req, res) => {
  socket
    .getTaskFile()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error("error?", err);
      res.send(err);
    });
});

router.get("/task/run", (req, res) => {
  socket
    .runTask()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error("error?", err);
      res.send(err);
    });
});

router.get("/task/stop", (req, res) => {
  socket
    .stopTask()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error("error?", err);
      res.send(err);
    });
});

router.get("/task/pause", (req, res) => {
  res.send("no function");
});

// router.get("/task/:name", (req, res) => {
//   parser
//     .parse(path.join(spath.task_path + "/work", req.params.name))
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.send(err);
//     });
// });

// router.post("/task/:name", (req, res) => {
//   parser
//     .save(path.join(spath.task_path + "/work", req.params.name), req.body)
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.send(err);
//     });
// });

// router.get("/task/load/:name", (req, res) => {
//   socket
//     .loadTask(path.join(spath.task_path + "/work", req.params.name))
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       console.error("Load Task Error :", err);
//       res.send(err);
//     });
// });

//-------------------------------New (~/maps)

router.get("/task/:map", (req, res) => {
  parser
    .list(os.homedir() + "/maps/" + req.params.map)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500).send();
    });
});

router.get("/task/:map/:name", (req, res) => {
  parser
    .parse(path.join(os.homedir(), "maps", req.params.map, req.params.name))
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    });
});

router.post("/task/:map/:name", (req, res) => {
  logger.info("save Task : " + req.params.map + ", " + req.params.name);
  console.log(path.join(os.homedir(), "maps", req.params.map, req.params.name));
  parser
    .save(
      path.join(os.homedir(), "maps", req.params.map, req.params.name),
      req.body
    )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    });
});

router.get("/task/load/:map/:name", (req, res) => {
  socket
    .loadTask(path.join(os.homedir(), "maps", req.params.map, req.params.name))
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.error("Load Task Error :", err);
      res.send(err);
    });
});

module.exports = router;
