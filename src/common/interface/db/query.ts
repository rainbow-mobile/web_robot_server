
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
export const create_variables = `CREATE TABLE variables(
	keystr varchar(128) not null primary key,
	valuestr varchar(128) not null
);`;
export const create_status = `CREATE TABLE status(
    time timestamp(3) not null default current_timestamp(3),
    conditions JSON not null,
	move_state JSON not null,
	robot_state JSON not null,
	map varchar(32),
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
export const create_system = `CREATE TABLE system(
	time timestamp(3) not null default current_timestamp(3),
	cpu float,
	cpu_cores JSON,
	memory_total float,
	memory_free float,
	network JSON,
	server JSON,
	webui JSON,
	slamnav JSON,
	taskman JSON
);`;
export const create_alarm = `CREATE TABLE alarm(
	alarmCode varchar(32) not null primary key,
	alarmDetail varchar(32),
	operationName varchar(32),
	alarmDescription varchar(255),
	isError tinyint(1)
);`;
export const create_alarmLog = `CREATE TABLE alarmLog(
	id varchar(32) not null primary key,
	alarmCode varchar(32) not null,
	state tinyint(1),
	emitFlag tinyint(1),
	time timestamp(3) not null current_timestamp(3)
);`;