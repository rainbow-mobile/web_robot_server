const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const compression = require("compression");
const network = require("./network");
const http = require("http");
const app = express();
const WebSocket = require("ws");
const morgan = require("morgan");
const logger = require("./log/logger");

//routers
const router_map = require("./routers/map_router");
const router_setting = require("./routers/setting_router");
const router_update = require("./routers/update_router");
const router_status = require("./routers/status_router");
const router_network = require("./routers/network_router");
const router_state = require("./routers/state_router");

const router_init = require("./routers/init_router");
const router_move = require("./routers/move_router");
const router_task = require("./routers/task_router");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

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
app.use("/", router_init);
app.use("/", router_move);
app.use("/", router_task);
app.use("/", router_state);

app.use(express.static(path.join(__dirname, "maps")));
app.use(cors());

// Swagger 옵션 설정
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sample API",
      version: "1.0.0",
      description: "Sample API documentation using Swagger",
    },
    servers: [
      {
        url: "http://localhost:11334",
      },
    ],
  },
  apis: ["./routes/*.js"], // API 명세를 작성할 파일 경로
};
// Swagger 명세 정의
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger UI 설정
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

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
