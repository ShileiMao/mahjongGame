var http_service = require("./http_service");
var socket_service = require("./socket_service");
const token_mgr = require('./tokenmgr');
const roomMgr = require('./roommgr')

console.log(process.versions);

//从配置文件获取服务器信息
var configs = require(process.argv[2]);
var config = configs.game_server();

var db = require('../utils/db');
const { md5 } = require("../utils/crypto");

db.init(configs.mysql());

//开启HTTP服务
// 暂时关闭
http_service.start(config);


// 创建假数据

// let roomInfo = {
//   roomId:123456,
//   userId: 123435,
//   ip: "localhost:10000",
//   port:10000,
//   token: "sbfdfadasfdasfdafs",
//   time: "2023-05-17",
//   sign: ""
// }

// const token = token_mgr.createToken(roomInfo.userId, 10000000000);
// roomInfo.token = token

// roomInfo.sign = md5(roomInfo.roomId + roomInfo.token + roomInfo.time + config.ROOM_PRI_KEY)
// console.log("token: " + token + "; sign: " + roomInfo.sign)

// roomMgr.enterRoomFake(roomInfo.roomId, roomInfo.userId, 1);


//开启外网SOCKET服务
socket_service.start(config);

//require('./gamemgr');