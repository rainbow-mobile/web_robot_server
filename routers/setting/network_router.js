"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment");
const path = require("path");
const cors = require("cors");
const router = express.Router();
const fs = require("fs");
const network = require("../../src/network");
const logger = require("../../src/log/logger");

router.use(bodyParser.json());
router.use(cors());

router.get("/network/current", (req, res) => {
  try {
    network
      .getNetwork()
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

router.get("/network/wifi/list", (req, res) => {
  try {
    network
      .getWifiList()
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

router.get("/network/wifi/scan", (req, res) => {
  try {
    network
      .scan()
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

router.put("/network/:device", (req, res) => {
  try {
    if (
      req.body.name == undefined ||
      req.body.name == null ||
      req.body.name == ""
    ) {
      res.sendStatus(400);
      return;
    }
    if (req.body.ip == undefined || req.body.ip == null || req.body.ip == "") {
      res.sendStatus(400);
      return;
    }
    if (
      req.body.gateway == undefined ||
      req.body.gateway == null ||
      req.body.gateway == ""
    ) {
      res.sendStatus(400);
      return;
    }
    if (
      req.body.subnet == undefined ||
      req.body.subnet == null ||
      req.body.subnet == ""
    ) {
      res.sendStatus(400);
      return;
    }
    if (req.body.dns == undefined || req.body.dns == null) {
      res.sendStatus(400);
      return;
    }

    logger.info("set IP " + req.params.device + " : ", req.body);
    network
      .setIP(req.body)
      .then((data) => {
        res.send(req.body);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/network/wifi", (req, res) => {
  try {
    if (
      req.body.ssid == undefined ||
      req.body.ssid == null ||
      req.body.ssid == ""
    ) {
      res.sendStatus(400);
      return;
    }

    network
      .connectWifi(req.body)
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

// router.post('/network/wifi/security',(req,res) =>{
//     console.log("============ Network Wifi(PASSWORD) Change");
//     network.connectWifi(req.body).then((data)=>{
//         res.send(data);
//     }).catch((err) =>{
//         console.error(err);
//         res.sendStatus(500);
//     })
// })

module.exports = router;
