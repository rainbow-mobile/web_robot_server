"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FootState = void 0;
var FootState;
(function (FootState) {
    FootState[FootState["Idle"] = 0] = "Idle";
    FootState[FootState["Init"] = 1] = "Init";
    FootState[FootState["Moving"] = 2] = "Moving";
    FootState[FootState["EmoStop"] = 3] = "EmoStop";
    FootState[FootState["DownDone"] = 4] = "DownDone";
    FootState[FootState["UpDone"] = 5] = "UpDone";
})(FootState || (exports.FootState = FootState = {}));
