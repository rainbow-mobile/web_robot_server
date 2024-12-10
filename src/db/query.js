const { create } = require("ts-node");

const create_curversion = `CREATE TABLE curversion(
	program varchar(32) not null primary key,
	date datetime(3) not null default now(3) on update now(3),
	version varchar(32) not null,
	prev_version varchar(32)
);`;

const create_log_slamnav2 = `CREATE TABLE log_SLAMNAV2(
	date datetime(3) not null default now(3),
	new_version varchar(32) not null,
	prev_version varchar(32),
	result varchar(32) not null
);`;

const create_log_mobileserver = `CREATE TABLE log_MobileServer(
	date datetime(3) not null default now(3),
	new_version varchar(32) not null,
	prev_version varchar(32),
	result varchar(32) not null
);`;
const create_log_mobileweb = `CREATE TABLE log_MobileWeb(
	date datetime(3) not null default now(3),
	new_version varchar(32) not null,
	prev_version varchar(32),
	result varchar(32) not null
);`;
const create_log_taskman = `CREATE TABLE log_TaskMan(
	date datetime(3) not null default now(3),
	new_version varchar(32) not null,
	prev_version varchar(32),
	result varchar(32) not null
);`;
const create_state = `CREATE TABLE state(
	time datetime(3) not null default now(3),
	state varchar(32) not null,
	auto_state varchar(32) not null,
	localization varchar(32) not null,
	power tinyint(1) not null,
	emo tinyint(1) not null,
	obs_state varchar(32) not null,
	charging varchar(32) not null,
	dock tinyint(1),
	inlier_ratio double not null,
	inlier_error double not null	
);`;
const create_power = `CREATE TABLE power(
	time datetime(3) not null default now(3),
	battery_in double not null,
	battery_out double not null,
	battery_current double not null,
	power double not null,
	total_power double not null,
	motor0_temp double not null,
	motor0_current double not null,
	motor0_status int not null,
	motor1_temp double not null,
	motor1_current double not null,
	motor1_status int not null,	
	charge_current double not null,
	contact_voltage double not null
);`;
const create_variables = `CREATE TABLE variables(
	keystr varchar(128) not null primary key,
	valuestr varchar(128) not null
);`;

module.exports = {
  create_curversion: create_curversion,
  create_log_mobileserver: create_log_mobileserver,
  create_log_mobileweb: create_log_mobileweb,
  create_log_slamnav2: create_log_slamnav2,
  create_log_taskman: create_log_taskman,
  create_power: create_power,
  create_state: create_state,
  create_variables: create_variables,
};
