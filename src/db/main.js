"use strict";
const sql = require("mariadb");
const logger = require("../log/logger");
const querys = require("./query");

let db = null;

async function connectToDatabase() {
  const host = "localhost";
  const user = "rainbow";
  const password = "rainbow";
  const database = "rainbow_rrs";

  // 데이터베이스 연결
  const pool = sql.createPool({
    host,
    user,
    password,
    connectionLimit: 5,
  });

  db = await pool.getConnection();

  //없으면 만든다
  await db.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  //사용 설정
  await db.query(`USE \`${database}\``);

  logger.info(`Connected to database: ${database}`);

  //테이블 확인
  await checkTables("curversion", querys.create_curversion);
  await checkTables("log_MobileServer", querys.create_log_mobileserver);
  await checkTables("log_MobileWeb", querys.create_log_mobileweb);
  await checkTables("log_SLAMNAV2", querys.create_log_slamnav2);
  await checkTables("log_TaskMan", querys.create_log_taskman);
  await checkTables("power", querys.create_power);
  await checkTables("state", querys.create_state);
  await checkTables("variables", querys.create_variables);
}
connectToDatabase();

async function checkTables(name, query) {
  // 테이블 존재 여부 확인
  const [rows] = await db.query(`
      SELECT COUNT(*)
      FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = '${name}'
    `);

  const tableExists = rows["COUNT(*)"] > 0;

  if (!tableExists) {
    logger.info(`Table "${name}" does not exist. Creating...`);
    await db.query(query);
    logger.info(`Table "${name}" created successfully.`);
  }
}
async function setQuery(query) {
  try {
    const result = await db.query(query); // Promise 기반으로 처리
    return result; // 성공 시 결과 반환
  } catch (err) {
    console.error("setQuery Error : ", err.message);
    throw err; // 에러를 상위로 전달
  }
}

module.exports = {
  setQuery: setQuery,
};
