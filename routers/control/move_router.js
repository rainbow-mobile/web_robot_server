"use strict";

const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const store = require("../../interfaces/stateManager");
const socket = require("../../src/socket/server");

router.use(bodyParser.json());
router.use(cors());

router.post("/control/move", async (req, res) => {
  try {
    const time = new Date().getTime();

    if (
      req.body.command == undefined ||
      req.body.command == null ||
      req.body.command == ""
    ) {
      res.sendStatus(400);
      return;
    }

    if (req.body.command == "target") {
      if (
        isNaN(Number(req.body.x)) ||
        isNaN(Number(req.body.y)) ||
        isNaN(Number(req.body.z)) ||
        isNaN(Number(req.body.rz)) ||
        isNaN(Number(req.body.preset))
      ) {
        res.status(400).send();
        return;
      }

      socket
        .moveCommand({
          command: req.body.command,
          x: req.body.x,
          y: req.body.y,
          z: req.body.z,
          rz: req.body.rz,
          preset: req.body.preset,
          method: req.body.method,
          id: req.body.id,
          time: time,
        })
        .then((data) => {
          res.send(data);
        })
        .catch((data) => {
          res.send(data);
        });
    } else if (req.body.command == "goal") {
      if (
        req.body.id == null ||
        req.body.id == undefined ||
        req.body.id == "" ||
        isNaN(Number(req.body.preset))
      ) {
        res.status(400).send();
        return;
      }

      socket
        .moveCommand({
          command: req.body.command,
          x: req.body.x,
          y: req.body.y,
          z: req.body.z,
          rz: req.body.rz,
          preset: req.body.preset,
          method: req.body.method,
          id: req.body.id,
          time: time,
        })
        .then((data) => {
          res.send(data);
        })
        .catch((data) => {
          res.send(data);
        });
    } else if (["pause", "resume", "stop"].includes(req.body.command)) {
      socket
        .sendCommand("move", {
          command: req.body.command,
          x: req.body.x,
          y: req.body.y,
          z: req.body.z,
          rz: req.body.rz,
          preset: req.body.preset,
          method: req.body.method,
          id: req.body.id,
          time: time,
        })
        .then((data) => {
          res.send(data);
        })
        .catch((data) => {
          res.send(data);
        });
    } else if (req.body.command == "jog") {
      if (
        isNaN(Number(req.body.vx)) ||
        isNaN(Number(req.body.vy)) ||
        isNaN(Number(req.body.wz))
      ) {
        res.status(400).send();
        return;
      }

      console.log("Jog receive : ", new Date().toLocaleTimeString());
      socket
        .sendJog("move", {
          command: "jog",
          vx: req.body.vx,
          vy: req.body.vy,
          wz: req.body.wz,
          time: time,
        })
        .catch((error) => {});
      res.send();
    } else {
      res.status(400).send();
      return;
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

//not used
router.get("/control/move", (req, res) => {
  try {
    socket
      .waitMove()
      .then((data) => {
        res.send(data);
      })
      .catch((error) => {
        console.error(error);
        res.send(error);
      });
  } catch (e) {
    res.sendStatus(500);
  }
});

module.exports = router;
