"use strict";
const sql = require("mysql");
const logger = require("../log/logger");

const versiondb = sql.createPool({
  host: "localhost",
  user: "root",
  password: "rainbow",
  database: "settingdb",
});

async function makeLogTable(name) {
  return await new Promise((resolve, reject) => {
    try {
      const query =
        "CREATE TABLE log_" +
        name +
        "(" +
        "date datetime(3) not null default now(3)," +
        "new_version varchar(32) not null," +
        "prev_version varchar(32)," +
        "result varchar(32) not null);";
      versiondb.query(query, (err, result) => {
        if (err) {
          reject({ error: err });
        }
        resolve(result);
      });
    } catch (error) {
      console.log("makeLogTable Catch:", error);
      reject({ error: error });
    }
  });
}

async function setQuery(query) {
  return await new Promise((resolve, reject) => {
    try {
      versiondb.query(query, (err, result) => {
        if (err) {
          reject({ error: err });
        }
        resolve(result);
      });
    } catch (error) {
      logger.error("SettingDB query Error : ", error);
      reject({ error: error });
    }
  });
}

async function getVariable(key) {
  return await new Promise((resolve, reject) => {
    try {
      const query = "SELECT * from variables";
      versiondb.query(query, (err, result) => {
        if (err) {
          reject("");
        }

        console.log(result);

        for (var i = 0; i < result.length; i++) {
          if (result[i].keystr == key) {
            resolve(result[i].valuestr);
            return;
          }
        }

        console.log("not found ", key);
        resolve("");
      });
    } catch (error) {
      logger.error("SettingDB query Error : ", error);
      reject("");
    }
  });
}
async function setVariable(key, value) {
  return await new Promise((resolve, reject) => {
    try {
      const query =
        "INSERT INTO variables (keystr, valuestr) values ('" +
        key +
        "', '" +
        value +
        "') on duplicate key update valuestr='" +
        value +
        "';";

      console.log(query);
      versiondb.query(query, (err, result) => {
        if (err) {
          console.error(err);
          reject();
        } else {
          resolve();
        }
      });
    } catch (error) {
      logger.error("SettingDB query Error : ", error);
      reject();
    }
  });
}

module.exports = {
  setQuery: setQuery,
  getVariable: getVariable,
  setVariable: setVariable,
};
