import express, {Express, Request, Response} from 'express'
import { FileUtils } from 'little-libs-backend';
import dotenv from 'dotenv';

const app: Express = express();
dotenv.config();

const port = process.env.PORT;

const gameRoot = FileUtils.resolveProjectPath("/game_root/web-mobile")
const gameRootWebDesktop = FileUtils.resolveProjectPath("/game_root/web-desktop")

app.use("/mobile", express.static(gameRoot));

app.use("/desktop", express.static(gameRootWebDesktop))


app.listen(8080, () => {
  console.log("server started at: " + 8080);
})