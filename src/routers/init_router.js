"use strict";

const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const socket = require("../socket/server");

router.use(bodyParser.json());
router.use(cors());

//초기 페이지 랜더링 시 서버 상태 요청
//SLAMNAV2 : Map Load Name, Localization, //////
router.get("/view/init", (req, res) => {
  res.send("not updated yet");
});

module.exports = router;
router.post("/localization", (req, res) => {
  try {
    if (
      req.body.command == undefined ||
      req.body.command == null ||
      req.body.command == ""
    ) {
      res.sendStatus(400);
      return;
    }

    socket
      .Localization({
        command: req.body.command,
        x: req.body.x,
        y: req.body.y,
        z: req.body.z,
        rz: req.body.rz,
        time: new Date().getTime(),
      })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  } catch (e) {
    res.sendStatus(500);
  }
});

router.get("/connection", (req, res) => {
  try {
    res.send(socket.getConnection());
  } catch (e) {
    res.sendStatus(500);
  }
});

module.exports = router;
