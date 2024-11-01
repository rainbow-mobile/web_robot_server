"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const router = express.Router();
const filesystem = require("../filesystem");
const fs = require("fs");
const moment = require("moment");
const update = require("../update.js");
const process = require("../process/runTest.js");
const spath = require("../../setting.json");
const monitor = require("../monitor.js");
const store = require("../interfaces/stateManager.js");

router.use(bodyParser.json());
router.use(cors());

router.post("/status", async (req, res) => {
  const date = moment();
  const date_str = date.format("YYYY-MM-DD HH:mm:ss.SSS").toString();
  monitor.setStatus({ ...req.body, date: date_str });
  res.send();
});

router.get("/status", (req, res) => {
  res.send(store.getState());
});

module.exports = router;
