"use strict";
const sql = require("mariadb");
const logger = require("../log/logger");
const { db, setQuery } = require("./main");

async function getVariable(key) {
  return await new Promise(async (resolve, reject) => {
    try {
      console.log(db);
      const query = "SELECT * from variables";
      const data = await setQuery(query);

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
      logger.error("DB query Error : ", error);
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

      const data = setQuery(query);
      resolve();
    } catch (error) {
      logger.error("DB query Error : ", error);
      reject();
    }
  });
}

module.exports = {
  getVariable: getVariable,
  setVariable: setVariable,
};
