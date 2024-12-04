"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const router = express.Router();
const moment = require("moment");
const update = require("../update.js");
const os = require("os");
const process = require("../process/runTest.js");
const spath = require("../../setting.json");
const versiondb = require("../db/version.js");
const db = require("../db/main.js");
const git = require("../git/git.js");

router.use(bodyParser.json());
router.use(cors());

router.get("/version/git/:filename", async (req, res) => {
  console.log("git version get : ", req.params.filename);
  const head = await git.getHeadInfo(req.params.filename);
  const fetchHead = await git.getFetchHeadInfo(req.params.filename);
  res.send({
    head: { ...head, date: moment(head.date) },
    fetchHead: { ...fetchHead, date: moment(fetchHead.date) },
  });
});

router.get("/versions/git/:filename", async (req, res) => {
  const data = await git.getLog(req.params.filename);
  res.send(data.all);
});

router.get("/version/make/:filename", (req, res) => {
  if (req.params.filename != "") {
    versiondb
      .makeLogTable(req.params.filename)
      .then((result) => {
        res.send(result);
      })
      .catch((error) => {
        if (error.error.code == "ER_TABLE_EXISTS_ERROR") {
          res.send({});
        } else {
          res.send(error);
        }
      });
  } else {
    res.sendStatus(400);
  }
});

router.get("/versions/:filename", (req, res) => {
  if (req.params.filename != "") {
    const sql =
      "select * from curversion where program = '" + req.params.filename + "';";
    db.setQuery(sql)
      .then((result) => {
        if (result.length > 0) {
          console.log(result);
          const date = moment(result[0].date);
          const date_str = date.format("YYYY-MM-DD HH:mm:ss.SSS").toString();
          res.send({
            data: { ...result[0], date: date_str },
            filename: req.params.filename,
          });
        } else {
          res.send({ filename: req.params.filename });
        }
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  } else {
    res.status(400).send({
      message: "params filename is missing",
      filename: req.params.filename,
    });
  }
});

router.post("/update", async (req, res) => {
  try {
    console.log("==========================UPDATE ");
    console.log(req.body);
    if (
      req.body.auth == undefined ||
      req.body.program == undefined ||
      req.body.new_version == undefined
    ) {
      console.log("???dddd?????");
      console.log(req.body);
      res
        .status(400)
        .send({ message: "Required body is missing", body: req.body });
    } else if (
      req.body.program == "" ||
      req.body.new_version == "0.0.0" ||
      req.body.path == ""
    ) {
      console.log("????????");
      res
        .status(401)
        .send({ message: "Required body is missing", body: req.body });
    } else {
      const date = moment();
      const date_str = date.format("YYYY-MM-DD HH:mm:ss.SSS").toString();

      console.log(req.body);
      const body = { ...req.body, path: os.homedir() + req.body.path };
      console.log(body);

      process
        .stopProcess(body.program)
        .then(async () => {
          process
            .checkBusy(body.path)
            .then(async () => {
              update
                .updateFile(body)
                .then(async (result) => {
                  console.log(
                    "File Download and updated successfully ",
                    body.path
                  );

                  res.send({
                    message: "update successfully done",
                    log: {
                      new_version: body.new_version,
                      cur_version: body.cur_version,
                      date: date_str,
                    },
                  });

                  process
                    .chmod(body.path)
                    .then(async () => {
                      const sql_version =
                        "UPDATE curversion set version='" +
                        body.new_version +
                        "', prev_version='" +
                        body.cur_version +
                        "' where program='" +
                        body.program +
                        "';";
                      console.log(sql_version);

                      await db
                        .setQuery(sql_version)
                        .then((result) => {})
                        .catch((err) => {
                          console.error("sqlVersion err: ", err);
                        });

                      versiondb
                        .makeLogTable(body.program)
                        .then(async () => {
                          const sql_log =
                            "INSERT log_" +
                            body.program +
                            " (new_version, prev_version, result) values ('" +
                            body.new_version +
                            "', '" +
                            body.cur_version +
                            "','success');";
                          console.log(sql_log);

                          await db
                            .setQuery(sql_log)
                            .then((result) => {})
                            .catch((err) => {
                              console.error("sqlLog err: ", err);
                            });

                          process
                            .restartProcess(body.program, body.path)
                            .then((r) => {
                              console.log("done");
                            })
                            .catch((err) => {
                              console.log("fail", err);
                            });
                        })
                        .catch(async (error) => {
                          if (error.error.code == "ER_TABLE_EXISTS_ERROR") {
                            const sql_log =
                              "INSERT log_" +
                              body.program +
                              " (new_version, prev_version, result) values ('" +
                              body.new_version +
                              "', '" +
                              body.cur_version +
                              "','success');";
                            console.log(sql_log);

                            await db
                              .setQuery(sql_log)
                              .then((result) => {})
                              .catch((err) => {
                                console.error("sqlLog err: ", err);
                              });

                            console.log("start ");
                            process
                              .restartProcess(body.program, body.path)
                              .then((r) => {
                                console.log("done");
                              })
                              .catch((err) => {
                                console.log("fail", err);
                              });
                          } else {
                            console.error("THIS?", error);
                          }
                        });
                    })
                    .catch((err) => {
                      console.error("THIS?", err);
                    });
                })
                .catch((error) => {
                  console.log(
                    "updatefile error :",
                    log_path,
                    logjson,
                    log_json
                  );
                  logjson["result"] = "failed";
                  const ff = body.program;

                  if (Array.isArray(log_json[ff])) {
                    log_json[ff].push(logjson);
                  }

                  update
                    .updateJson(log_path, log_json)
                    .then((result) => {})
                    .catch((error) => {
                      console.error("UpdateJson : ", error);
                    });

                  console.error("UpdateFile : ", error);
                  res.status(500).send({ message: "Got Error", error: error });
                });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send();
            });
        })
        .catch((err) => {
          console.error("stopTest error : ", err);
        });
    }
  } catch (error) {
    console.error("Post : ", error);
    res.status(500).send({ message: "Failed", error: error, body: req.body });
  }
});

router.get("/start/:filename", (req, res) => {
  if (req.params.filename == "TaskMan") {
    const exePath = path.join(spath.task_path + "/" + req.params.filename);
    process
      .startProcess(req.params.filename, exePath)
      .then((message) => {
        console.log(message);
        res.send(message);
      })
      .catch((err) => {
        console.error("startProcess error : ", err);
        res.send(err);
      });
  } else if (req.params.filename == "MobileServer") {
  } else if (req.params.filename == "MobileWeb") {
  } else if (req.params.filename.includes("SLAMNAV")) {
    const exePath = path.join(spath.slam_path + "/" + req.params.filename);
    process
      .startProcess(req.params.filename, exePath)
      .then((message) => {
        console.log(message);
        res.send(message);
      })
      .catch((err) => {
        console.error("startProcess error : ", err);
        res.send(err);
      });
  } else {
    console.error("Unknown Start Program : ", req.params.filename);
    res.sendStatus(400);
  }
});

router.get("/stop/:filename", (req, res) => {
  if (req.params.filename == "TaskMan") {
    process
      .stopProcess(req.params.filename)
      .then((message) => {
        res.send(message);
      })
      .catch((err) => {
        console.error("stopProcess error : ", err);
        res.send(err);
      });
  } else if (req.params.filename == "MobileServer") {
  } else if (req.params.filename == "MobileWeb") {
  } else if (req.params.filename.includes("SLAMNAV")) {
    process
      .stopProcess(req.params.filename)
      .then((message) => {
        console.log(message);
        res.send(message);
      })
      .catch((err) => {
        console.error("stopProcess error : ", err);
        res.send(err);
      });
  } else {
    console.error("Unknown Start Program : ", req.params.filename);
    res.sendStatus(400);
  }
});

router.get("/restart/:filename", (req, res) => {
  if (req.params.filename == "TaskMan") {
    const exePath = path.join(spath.task_path + "/" + req.params.filename);
    process
      .restartProcess(req.params.filename, exePath)
      .then((message) => {
        res.send(message);
      })
      .catch((err) => {
        console.error("restartProcess error : ", err);
        res.send(err);
      });
  } else if (req.params.filename == "MobileServer") {
    res.send();
    console.log("HI");
  } else if (req.params.filename == "MobileWeb") {
  } else if (req.params.filename.includes("SLAMNAV")) {
    const exePath = path.join(spath.slam_path + "/" + req.params.filename);
    process
      .restartProcess(req.params.filename, exePath)
      .then((message) => {
        console.log(message);
        res.send(message);
      })
      .catch((err) => {
        console.error("restartProcess error : ", err);
        res.send(err);
      });
  } else {
    console.error("Unknown Start Program : ", req.params.filename);
    res.sendStatus(400);
  }
});
const { spawn, exec } = require("child_process");

module.exports = router;
