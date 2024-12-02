"use strict";
const sql = require("mariadb");
const logger = require("../log/logger");
const { setQuery } = require("./main");

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
      setQuery(query, (err, result) => {
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

module.exports = {
  makeLogTable: makeLogTable,
};
