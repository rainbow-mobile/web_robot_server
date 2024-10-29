"use strict";
const sql = require("mysql");
const logger = require("../log/logger");

const logdb = sql.createPool({
  host: "localhost",
  user: "root",
  password: "rainbow",
  database: "logdb",
});

async function setQuery(query) {
  return await new Promise((resolve, reject) => {
    try {
      logdb.query(query, (err, result) => {
        if (err) {
          reject({ error: err });
        }
        resolve(result);
      });
    } catch (error) {
      logger.error("LogDB query Error : ", error);
      reject({ error: error });
    }
  });
}

async function getState(state) {
  if (state.state.charge == undefined) {
    console.log(state);
  }
  if (state.state.charge == "true") {
    return "Charging";
  } else {
    if (state.state.power == "false") {
      return "Power Off";
    } else if (state.condition.mapping_ratio > 1) {
      return "Mapping";
    } else {
      if (
        state.state.map == "" ||
        state.state.localization != "good" ||
        state.motor[0].status != 1 ||
        state.motor[1].status != 1
      ) {
        return "Not Ready";
      } else if (state.condition.obs_state != "none") {
        return "Obstacle";
      } else if (state.condition.auto_state == "move") {
        return "Moving";
      } else if (state.condition.auto_state == "pause") {
        return "Paused";
      } else if (state.condition.auto_state == "stop") {
        return "Ready";
      } else {
        return "?";
      }
    }
  }
}

async function updateState(state) {
  try {
    var sql =
      "INSERT state (state, auto_state, localization, power, emo, obs_state, charging, inlier_ratio, inlier_error) values (";
    sql += "'" + (await getState(state)) + "'";
    sql += ", '" + state.condition.auto_state + "'";
    sql += ", '" + state.state.localization + "'";
    sql += state.state.power ? ", '1'" : ", '0'";
    sql += state.state.emo ? ", '1'" : ", '0'";
    sql += ", '" + state.condition.obs_state + "'";
    sql += state.state.charge ? ", '1'" : ", '0'";
    sql += ", '" + state.condition.inlier_ratio + "'";
    sql += ", '" + state.condition.inlier_error + "');";

    await setQuery(sql);
  } catch (error) {
    console.error("updateState Error : ", error);
  }
}

//********************** 240912 motor[1]current 필히!!!!! 수정할 것 !!!!!!! */
async function updatePower(state) {
  try {
    var sql =
      "INSERT power (battery_in, battery_out, battery_current, power, total_power, motor0_temp, motor0_current, motor0_status, motor1_temp, motor1_current, motor1_status) values (";
    sql += "'" + state.power.bat_in + "'";
    sql += ", '" + state.power.bat_out + "'";
    sql += ", '" + state.power.bat_current + "'";
    sql += ", '" + state.power.power + "'";
    sql += ", '" + state.power.total_power + "'";
    sql += ", '" + state.motor[0].temp + "'";
    sql += ", '" + state.motor[0].current + "'";
    sql += ", '" + state.motor[0].status + "'";
    sql += ", '" + state.motor[1].temp + "'";
    sql += ", '" + state.motor[0].current + "'";
    sql += ", '" + state.motor[1].status + "');";

    // console.log("updatePower Querry: ", sql);
    await setQuery(sql);
  } catch (error) {
    console.error("updatePower Error : ", error);
  }
}

async function deleteOld() {
  try {
    const sql = "DELETE FROM state WHERE time < NOW() - INTERVAL 12 HOUR";
    // console.log("deleteOld Querry: ", sql);
    setQuery(sql);
    const sql2 = "DELETE FROM power WHERE time < NOW() - INTERVAL 12 HOUR";
    // console.log("deleteOld Querry: ", sql2);
    setQuery(sql2);
  } catch (error) {
    console.error("deleteOld Error : ", error);
  }
}
async function getStateLog() {
  try {
    var sql = "SELECT * from state;";
    await setQuery(sql);
  } catch (error) {
    console.error("updatePower Error : ", error);
  }
}

module.exports = {
  setQuery: setQuery,
  updateState: updateState,
  updatePower: updatePower,
  getState: getState,
  deleteOld: deleteOld,
};
