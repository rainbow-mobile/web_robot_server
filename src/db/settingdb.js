"use strict";
const sql = require("mariadb");
const logger = require("../log/logger");

const settingdb = sql.createPool({
  host: "localhost",
  user: "rainbow",
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
  return await new Promise(async (resolve, reject) => {
    try {
      const query = "SELECT * from variables";
      const data = await settingdb.query(query);

      console.log(data);

      for (var i = 0; i < data.length; i++) {
        if (data[i].keystr == key) {
          resolve(data[i].valuestr);
          return;
        }
      }

      console.log("not found ", key);
      resolve("");
    } catch (error) {
      logger.error("SettingDB query Error : ", error);
      reject("");
    }
  });
}
async function setVariable(key, value) {
  return await new Promise(async (resolve, reject) => {
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
      const data = settingdb.query(query);
      console.log("GET DATA : ", data);
      resolve();
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
