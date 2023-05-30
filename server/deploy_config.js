const ACCOUNT_SERVER_PORT = 9000;
const HALL_CLIENT_PORT = 9001;
const HALL_ROOM_PORT = 9002;
const GAME_SERVER_PORT = 9003;
const GAME_SOCKET_SERVER_PORT = 10000;

const SERVER_IP = "124.220.156.23"

const ACCOUNT_SERVER_URL = `http://${SERVER_IP}:${ACCOUNT_SERVER_PORT}`
const HALL_CLIENT_SERVER_URL = `http://${SERVER_IP}:${HALL_CLIENT_PORT}`
const HALL_ROOM_SERVER_IP = `${SERVER_IP}`
const GAME_SERVER_IP = `${SERVER_IP}`


var ACCOUNT_PRI_KEY = "^&*#$%()@";
var ROOM_PRI_KEY = "~!@#$(*&^%$&";

var LOCAL_IP = 'localhost';

exports.mysql = function(){
	return {
		HOST:'127.0.0.1',
		USER:'root',
		PSWD:'Admin!23',
		DB:'mj_server',
		PORT:3306,
	}
}

//账号服配置
exports.account_server = function(){
	return {
		CLIENT_PORT: ACCOUNT_SERVER_PORT,
		HALL_URL: HALL_CLIENT_SERVER_URL,
		ACCOUNT_PRI_KEY:ACCOUNT_PRI_KEY,
		
		//
		DEALDER_API_IP:LOCAL_IP,
		DEALDER_API_PORT:12581,
		VERSION:'20161227',
		APP_WEB:'http://fir.im/2f17',
	};
};

//大厅服配置
exports.hall_server = function(){
	return {
		CLEINT_PORT:HALL_CLIENT_PORT,
		FOR_ROOM_IP:LOCAL_IP,
		ROOM_PORT:HALL_ROOM_PORT,
		ACCOUNT_PRI_KEY:ACCOUNT_PRI_KEY,
		ROOM_PRI_KEY:ROOM_PRI_KEY
	};
};

//游戏服配置
exports.game_server = function(){
	return {
		SERVER_ID:"001",
		
		//暴露给大厅服的HTTP端口号
		HTTP_PORT: GAME_SERVER_PORT,
		//HTTP TICK的间隔时间，用于向大厅服汇报情况
		HTTP_TICK_TIME:5000,
		//大厅服IP
		FOR_HALL_IP:LOCAL_IP,
		//大厅服端口
		// HALL_IP: HALL_ROOM_SERVER_IP, // 还是访问localhost吧。。
		HALL_IP: LOCAL_IP,
		HALL_PORT: HALL_ROOM_PORT,
		//与大厅服协商好的通信加密KEY
		ROOM_PRI_KEY:ROOM_PRI_KEY,
		
		//暴露给客户端的接口
		CLIENT_IP: GAME_SERVER_IP,
		CLIENT_PORT: GAME_SOCKET_SERVER_PORT, // socket 服务器的端口
	};
};