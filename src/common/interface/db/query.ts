
export const create_curversion = `CREATE TABLE curversion(
	program varchar(32) not null primary key,
	date datetime(3) not null default now(3) on update now(3),
	version varchar(32) not null,
	prev_version varchar(32)
);`;

export const create_log_slamnav2 = `CREATE TABLE log_SLAMNAV2(
	date datetime(3) not null default now(3),
	new_version varchar(32) not null,
	prev_version varchar(32),
	result varchar(32) not null
);`;

export const create_log_mobileserver = `CREATE TABLE log_MobileServer(
	date datetime(3) not null default now(3),
	new_version varchar(32) not null,
	prev_version varchar(32),
	result varchar(32) not null
);`;
export const create_log_mobileweb = `CREATE TABLE log_MobileWeb(
	date datetime(3) not null default now(3),
	new_version varchar(32) not null,
	prev_version varchar(32),
	result varchar(32) not null
);`;
export const create_log_taskman = `CREATE TABLE log_TaskMan(
	date datetime(3) not null default now(3),
	new_version varchar(32) not null,
	prev_version varchar(32),
	result varchar(32) not null
);`;
export const create_state = `CREATE TABLE state(
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
export const create_power = `CREATE TABLE power(
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
export const create_variables = `CREATE TABLE variables(
	keystr varchar(128) not null primary key,
	valuestr varchar(128) not null
);`;
export const create_status = `CREATE TABLE status(
    time timestamp(3) not null default current_timestamp(3),
    conditions JSON not null,
	state JSON not null,
	motor0 JSON not null,
	motor1 JSON not null,
	power JSON not null,
	imu JSON not null,
	slam tinyint(1) not null,
	type varchar(32) not null,
	task JSON,
	pose JSON
);`;
export const create_status_archive = `CREATE TABLE status_archive(
	time timestamp(3) not null default current_timestamp(3),
	status JSON,
	date varchar(32) not null unique
)`;