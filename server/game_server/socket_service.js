var crypto = require('../utils/crypto');
var db = require('../utils/db');

var tokenMgr = require('./tokenmgr');
var roomMgr = require('./roommgr');
var userMgr = require('./usermgr');

const {WebSocketServer} = require('ws')

class WebSocketWrapper {
  eventHandlers = {};
  socket = null
  constructor(socket) {
    this.socket = socket;
    this.socket.on("message", (message) => {
      this.processEvent(message);
    })
  }

  addEventHandler(event, callback) {
    if(this.eventHandlers[event]) {
      console.log(" the event handler already exists: " + event);
      return
    }

    this.eventHandlers[event] = callback;
  }

  processEvent(rawMessage) {
    console.log("process raw message: " + rawMessage);
    try {
      const jsonObj = JSON.parse(rawMessage);
      if(Array.isArray(jsonObj) && jsonObj.length > 0) {
        const eventName = jsonObj[0];
        if(this.eventHandlers[eventName]) {
          this.eventHandlers[eventName](jsonObj[1] || "");
        }
      }
    } catch(error) {
      console.error(`failed to parse raw message, this is an unkown event! \nerror: ${error}\nraw message: ${rawMessage}"`);
    }
  }

  emit(event, data = {}) {
    this.socket.send(JSON.stringify([event, data]));
  }
}

exports.start = function(config,mgr){

	const socketServer = new WebSocketServer({
		port: config.CLIENT_PORT
	});

	// const socketWrappers = [];

	// socketServer.emit
	socketServer.on('connection',function(socket){
		userMgr.sendMsg('gameServer');
		const socketWrapper = new WebSocketWrapper(socket);
	
		socketWrapper.addEventHandler('login',function(data){
			if(socketWrapper.userId != null){
				//已经登陆过的就忽略
				return;
			}
			var token = data.token;
			var roomId = data.roomid;
			var time = data.time;
			var sign = data.sign;

			console.log(roomId);
			console.log(token);
			console.log(time);
			console.log(sign);

			
			//检查参数合法性
			if(token == null || roomId == null || sign == null || time == null){
				console.log(1);
				console.log("socket event, invalid params")
				socketWrapper.emit('login_result',{errcode:1,errmsg:"invalid parameters"});
				return;
			}
			
			//检查参数是否被篡改
			var md5 = crypto.md5(roomId + token + time + config.ROOM_PRI_KEY);
			if(md5 != sign){
				console.log(2);
				socketWrapper.emit('login_result',{errcode:2,errmsg:"login failed. invalid sign!"});
				return;
			}
			
			//检查token是否有效
			if(tokenMgr.isTokenValid(token)==false){
				console.log(3);
				socketWrapper.emit('login_result',{errcode:3,errmsg:"token out of time."});
				return;
			}
			
			//检查房间合法性
			var userId = tokenMgr.getUserID(token);
			var roomId = roomMgr.getUserRoom(userId);

			userMgr.bind(userId,socketWrapper);
			socketWrapper.userId = userId;

			//返回房间信息
			var roomInfo = roomMgr.getRoom(roomId);
			
			var seatIndex = roomMgr.getUserSeat(userId);
			roomInfo.seats[seatIndex].ip = socketWrapper.socket._socket.remoteAddress;
			
			console.log("****** seats ip: " + socketWrapper.socket._socket.remoteAddress)

			var userData = null;
			var seats = [];
			for(var i = 0; i < roomInfo.seats.length; ++i){
				var rs = roomInfo.seats[i];
				var online = false;
				if(rs.userId > 0){
					online = userMgr.isOnline(rs.userId);
				}

				seats.push({
					userid:rs.userId,
					ip:rs.ip,
					score:rs.score,
					name:rs.name,
					online:online,
					ready:rs.ready,
					seatindex:i
				});

				if(userId == rs.userId){
					userData = seats[i];
				}
			}

			//通知前端
			var ret = {
				errcode:0,
				errmsg:"ok",
				data:{
					roomid:roomInfo.id,
					conf:roomInfo.conf,
					numofgames:roomInfo.numOfGames,
					seats:seats
				}
			};
			socketWrapper.emit('login_result',ret);

			//通知其它客户端
			userMgr.broacastInRoom('new_user_comes_push',userData,userId);
			
			socketWrapper.gameMgr = roomInfo.gameMgr;

			//玩家上线，强制设置为TRUE
			socketWrapper.gameMgr.setReady(userId);

			socketWrapper.emit('login_finished');

			if(roomInfo.dr != null){
				var dr = roomInfo.dr;
				var ramaingTime = (dr.endTime - Date.now()) / 1000;
				var data = {
					time:ramaingTime,
					states:dr.states
				}
				userMgr.sendMsg(userId,'dissolve_notice_push',data);	
			}
		});

		socketWrapper.addEventHandler('ready',function(data){
			var userId = socketWrapper.userId;
			if(userId == null){
				return;
			}
			socketWrapper.gameMgr.setReady(userId);
			userMgr.broacastInRoom('user_ready_push',{userid:userId,ready:true},userId,true);
		});

		//换牌
		socketWrapper.addEventHandler('huanpai',function(data){
			if(socketWrapper.userId == null){
				return;
			}
			if(data == null){
				return;
			}

			if(typeof(data) == "string"){
				data = JSON.parse(data);
			}

			var p1 = data.p1;
			var p2 = data.p2;
			var p3 = data.p3;
			if(p1 == null || p2 == null || p3 == null){
				console.log("invalid data");
				return;
			}
			socketWrapper.gameMgr.huanSanZhang(socketWrapper.userId,p1,p2,p3);
		});

		//定缺
		socketWrapper.addEventHandler('dingque',function(data){
			if(socketWrapper.userId == null){
				return;
			}
			var que = data;
			socketWrapper.gameMgr.dingQue(socketWrapper.userId,que);
		});

		//出牌
		socketWrapper.addEventHandler('chupai',function(data){
			if(socketWrapper.userId == null){
				return;
			}
			var pai = data;
			socketWrapper.gameMgr.chuPai(socketWrapper.userId,pai);
		});
		
		//碰
		socketWrapper.addEventHandler('peng',function(data){
			if(socsocketWrapperket.userId == null){
				return;
			}
			socketWrapper.gameMgr.peng(socketWrapper.userId);
		});
		
		//杠
		socketWrapper.addEventHandler('gang',function(data){
			if(socketWrapper.userId == null || data == null){
				return;
			}
			var pai = -1;
			if(typeof(data) == "number"){
				pai = data;
			}
			else if(typeof(data) == "string"){
				pai = parseInt(data);
			}
			else{
				console.log("gang:invalid param");
				return;
			}
			socketWrapper.gameMgr.gang(socketWrapper.userId,pai);
		});
		
		//胡
		socketWrapper.addEventHandler('hu',function(data){
			if(socketWrapper.userId == null){
				return;
			}
			socketWrapper.gameMgr.hu(socketWrapper.userId);
		});

		//过  遇上胡，碰，杠的时候，可以选择过
		socketWrapper.addEventHandler('guo',function(data){
			if(socketWrapper.userId == null){
				return;
			}
			socketWrapper.gameMgr.guo(socketWrapper.userId);
		});
		
		//聊天
		socketWrapper.addEventHandler('chat',function(data){
			if(socketWrapper.userId == null){
				return;
			}
			var chatContent = data;
			userMgr.broacastInRoom('chat_push',{sender:socketWrapper.userId,content:chatContent},socketWrapper.userId,true);
		});
		
		//快速聊天
		socketWrapper.addEventHandler('quick_chat',function(data){
			if(socketWrapper.userId == null){
				return;
			}
			var chatId = data;
			userMgr.broacastInRoom('quick_chat_push',{sender:socketWrapper.userId,content:chatId},socketWrapper.userId,true);
		});
		
		//语音聊天
		socketWrapper.addEventHandler('voice_msg',function(data){
			if(socketWrapper.userId == null){
				return;
			}
			console.log(data.length);
			userMgr.broacastInRoom('voice_msg_push',{sender:socketWrapper.userId,content:data},socketWrapper.userId,true);
		});
		
		//表情
		socketWrapper.addEventHandler('emoji',function(data){
			if(socketWrapper.userId == null){
				return;
			}
			var phizId = data;
			userMgr.broacastInRoom('emoji_push',{sender:socketWrapper.userId,content:phizId},socketWrapper.userId,true);
		});
		
		//语音使用SDK不出现在这里
		
		//退出房间
		socketWrapper.addEventHandler('exit',function(data){
			var userId = socketWrapper.userId;
			if(userId == null){
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				return;
			}

			//如果游戏已经开始，则不可以
			if(socketWrapper.gameMgr.hasBegan(roomId)){
				return;
			}

			//如果是房主，则只能走解散房间
			if(roomMgr.isCreator(userId)){
				return;
			}
			
			//通知其它玩家，有人退出了房间
			userMgr.broacastInRoom('exit_notify_push',userId,userId,false);
			
			roomMgr.exitRoom(userId);
			userMgr.del(userId);
			
			socketWrapper.emit('exit_result');
			socketWrapper.socket.close();
		});
		
		//解散房间
		socketWrapper.addEventHandler('dispress',function(data){
			var userId = socketWrapper.userId;
			if(userId == null){
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				return;
			}

			//如果游戏已经开始，则不可以
			if(socketWrapper.gameMgr.hasBegan(roomId)){
				return;
			}

			//如果不是房主，则不能解散房间
			if(roomMgr.isCreator(roomId,userId) == false){
				return;
			}
			
			userMgr.broacastInRoom('dispress_push',{},userId,true);
			userMgr.kickAllInRoom(roomId);
			roomMgr.destroy(roomId);
			socketWrapper.socket.close();
		});

		//解散房间
		socketWrapper.addEventHandler('dissolve_request',function(data){
			var userId = socketWrapper.userId;
			console.log(1);
			if(userId == null){
				console.log(2);
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				console.log(3);
				return;
			}

			//如果游戏未开始，则不可以
			if(socketWrapper.gameMgr.hasBegan(roomId) == false){
				console.log(4);
				return;
			}

			var ret = socketWrapper.gameMgr.dissolveRequest(roomId,userId);
			if(ret != null){
				var dr = ret.dr;
				var ramaingTime = (dr.endTime - Date.now()) / 1000;
				var data = {
					time:ramaingTime,
					states:dr.states
				}
				console.log(5);
				userMgr.broacastInRoom('dissolve_notice_push',data,userId,true);
			}
			console.log(6);
		});

		socketWrapper.addEventHandler('dissolve_agree',function(data){
			var userId = socketWrapper.userId;

			if(userId == null){
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				return;
			}

			var ret = socketWrapper.gameMgr.dissolveAgree(roomId,userId,true);
			if(ret != null){
				var dr = ret.dr;
				var ramaingTime = (dr.endTime - Date.now()) / 1000;
				var data = {
					time:ramaingTime,
					states:dr.states
				}
				userMgr.broacastInRoom('dissolve_notice_push',data,userId,true);

				var doAllAgree = true;
				for(var i = 0; i < dr.states.length; ++i){
					if(dr.states[i] == false){
						doAllAgree = false;
						break;
					}
				}

				if(doAllAgree){
					socketWrapper.gameMgr.doDissolve(roomId);					
				}
			}
		});

		socketWrapper.addEventHandler('dissolve_reject',function(data){
			var userId = socketWrapper.userId;

			if(userId == null){
				return;
			}

			var roomId = roomMgr.getUserRoom(userId);
			if(roomId == null){
				return;
			}

			var ret = socketWrapper.gameMgr.dissolveAgree(roomId,userId,false);
			if(ret != null){
				userMgr.broacastInRoom('dissolve_cancel_push',{},userId,true);
			}
		});

		//断开链接
		socket.on('close',function(data){
			var userId = socketWrapper.userId;
			if(!userId){
				return;
			}
			var data = {
				userid:userId,
				online:false
			};

			//通知房间内其它玩家
			userMgr.broacastInRoom('user_state_push',data,userId);

			//清除玩家的在线信息
			userMgr.del(userId);
			socketWrapper.userId = null;
		});
		
		socketWrapper.addEventHandler('game_ping',function(data){
			var userId = socketWrapper.userId;
			if(!userId){
				return;
			}
			//console.log('game_ping');
			socketWrapper.emit('game_pong');
		});
	});

	console.log("game server is listening on " + config.CLIENT_PORT);	
};