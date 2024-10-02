"use strict";
const sql = require("mysql");

const versiondb = sql.createPool({
  host: "localhost",
  user: "root",
  password: "rainbow",
  database: "versiondb",
});

// versiondb.connect((err) =>{
//     if(err){
//         console.error("versiondb : connet error ",err);
//         throw err;
//     }
//     console.log("versiondb : connected");
// });

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
      console.log("SetQuery Catch:", error);
      reject({ error: error });
    }
  });
}

module.exports = {
  setQuery: setQuery,
  makeLogTable: makeLogTable,
};
