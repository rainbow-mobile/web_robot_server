const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { spawn, exec } = require("child_process");
const runProcess = require("../process/runTest");
const monitor = require("./monitor");
const compression = require("compression");
const network = require("../src/network");
const http = require("http");
const app = express();
const WebSocket = require("ws");
const morgan = require("morgan");
const logger = require("./log/logger");

//routers
const router_map = require("../routers/view/map_router");
const router_setting = require("../routers/setting/setting_router");
const router_update = require("../routers/setting/update_router");
const router_status = require("../routers/view/status_router");
const router_network = require("../routers/setting/network_router");
const router_state = require("../routers/setting/state_router");

const router_init = require("../routers/control/init_router");
const router_move = require("../routers/control/move_router");
const router_task = require("../routers/view/task_router");
const router_view = require("../routers/view/init_router");

const httplogStream = fs.createWriteStream("Log/HTTP.log", { flags: "a" });

app.use(morgan("combined", { stream: httplogStream }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use("/", router_map);
app.use("/", router_setting);
app.use("/", router_update);
app.use("/", router_status);
app.use("/", router_network);
app.use("/", router_view);
app.use("/", router_init);
app.use("/", router_move);
app.use("/", router_task);
app.use("/", router_state);
// app.use(express.static("/home/rainbow/RB_MOBILE"));
app.use(express.static(path.join(__dirname, "maps")));
app.use(cors());

const mainServer = http.createServer(app);

network.scan();
// monitor.getServerInfo();

mainServer.on("error", (e) => {
  logger.error("Server Error : ", e);
});
mainServer.listen(11334, function () {
  logger.info("Server Open -> 11334");
});

app.get("/exit", async (req, res) => {
  res.send();
  process.exit(0);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); // HTML 파일의 경로를 설정
});
