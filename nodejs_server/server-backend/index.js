"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const little_libs_backend_1 = require("little-libs-backend");
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
dotenv_1.default.config();
const port = process.env.PORT;
const gameRoot = little_libs_backend_1.FileUtils.resolveProjectPath("/game_root/web-mobile");
const gameRootWebDesktop = little_libs_backend_1.FileUtils.resolveProjectPath("/game_root/web-desktop");
app.use("/mobile", express_1.default.static(gameRoot));
app.use("/desktop", express_1.default.static(gameRootWebDesktop));
app.listen(8080, () => {
    console.log("server started at: " + 8080);
});
