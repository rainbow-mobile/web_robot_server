"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeState = exports.PathType = exports.AutoMoveType = void 0;
var AutoMoveType;
(function (AutoMoveType) {
    AutoMoveType["NOT_READY"] = "not ready";
    AutoMoveType["STOP"] = "stop";
    AutoMoveType["MOVE"] = "move";
    AutoMoveType["PAUSE"] = "pause";
    AutoMoveType["ERROR"] = "error";
    AutoMoveType["VIR"] = "vir";
})(AutoMoveType || (exports.AutoMoveType = AutoMoveType = {}));
var PathType;
(function (PathType) {
    PathType["NONE"] = "none";
    PathType["REQ_PATH"] = "req_path";
    PathType["RECV_PATH"] = "recv_path";
})(PathType || (exports.PathType = PathType = {}));
var NodeState;
(function (NodeState) {
    NodeState["NONE"] = "none";
    NodeState["MOVE"] = "move";
    NodeState["COMPLETE"] = "complete";
    NodeState["FAIL"] = "fail";
    NodeState["OBSTACLE"] = "obstacle";
    NodeState["CANCEL"] = "cancel";
})(NodeState || (exports.NodeState = NodeState = {}));
//# sourceMappingURL=move.enum.js.map