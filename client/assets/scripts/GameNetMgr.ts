import { _decorator, Component, EventTarget, director } from 'cc';
import { AppGlobal } from './components/AppGlobal';
const { ccclass, property } = _decorator;
export interface PlayerHolds {
    userid: number
    name: string
    seatindex: number
    holds: string[]
    folds: string[]
    pengs: string[]
    angangs: string[]
    diangangs: string[]
    wangangs: string[]
    dingque: number
    ready: boolean
    
    // 是否已胡牌？
    hued: boolean  
    huanpais: string
    score: number
    online: boolean
    ip: string,
    iszimo: boolean,
    huinfo: any
}

interface RoomConf {
    type: string;
	difen: number; // 底分（每局起始分数）int
	zimo: number // 自摸加番 int
    jiangdui: boolean
	huansanzhang: boolean; // 换三张 （血流成河打法）
	zuidafanshu: number; // 最大蕃数
	jushuxuanze: number;
	dianganghua: number;
	menqing: boolean; // 门清 （自摸)
	tiandihu: boolean; // 天地胡
    maxGames: number,
    maxFan: number,
    hsz: boolean,
}

@ccclass('GameNetMgr')
export class GameNetMgr extends Component {
    @property
    public dataEventHandler: EventTarget;
    @property
    public roomId = null;
    @property
    public maxNumOfGames = 0;
    @property
    public numOfGames = 0;
    @property
    public numOfMJ = 0;
    @property
    public seatIndex = -1;
    @property
    public seats: PlayerHolds[] = [];
    @property
    public turn = -1;
    @property
    public button = -1;
    
    /**
     * 玩家界面选择的缺一门牌类型
     * 筒 = 0
     * 条 = 1
     * 万 = 2
     */
    @property
    public dingque = -1;
    @property
    public chupai = -1;
    @property
    public isDingQueing = false;
    @property
    public isHuanSanZhang = false;
    @property
    public gamestate = '';
    @property
    public isOver = false;
    @property
    public dissoveData = null;

    public curaction: any
    public huanpaimethod: number
    public conf: RoomConf

    reset () {
        this.turn = -1;
        this.chupai = -1,
        this.dingque = -1;
        this.button = -1;
        this.gamestate = "";
        this.dingque = -1;
        this.isDingQueing = false;
        this.isHuanSanZhang = false;
        this.curaction = null;
        for(var i = 0; i < this.seats.length; ++i){
           this.seats[i].holds = [];
           this.seats[i].folds = [];
           this.seats[i].pengs = [];
           this.seats[i].angangs = [];
           this.seats[i].diangangs = [];
           this.seats[i].wangangs = [];
           this.seats[i].dingque = -1;
           this.seats[i].ready = false;
           this.seats[i].hued = false;
           this.seats[i].huanpais = null;
           this.huanpaimethod = -1;
        }
    }

    clear () {
        this.dataEventHandler = null;
        if(this.isOver == null){
           this.seats = null;
           this.roomId = null;
           this.maxNumOfGames = 0;
           this.numOfGames = 0;        
        }
    }

    dispatchEvent (event: string, data: any = null) {
        if(this.dataEventHandler){
            console.warn("check this shit!!!!!!!!!!!!!!");
           this.dataEventHandler.emit(event, data)
        }    
    }

    getSeatIndexByID (userId: any) {
        for(var i = 0; i < this.seats.length; ++i){
           var s = this.seats[i];
           if(s.userid == userId){
               return i;
           }
        }
        return -1;
    }

    isOwner () {
        return this.seatIndex == 0;   
    }

    getSeatByID (userId: any) {
        var seatIndex = this.getSeatIndexByID(userId);
        var seat = this.seats[seatIndex];
        return seat;
    }

    getSelfData () {
        return this.seats[this.seatIndex];
    }

    getLocalIndex (index: any) {
        var ret = (index - this.seatIndex + 4) % 4;
        return ret;
    }

    prepareReplay (roomInfo: any, detailOfGame: any) {
        this.roomId = roomInfo.id;
        this.seats = roomInfo.seats;
        this.turn = detailOfGame.base_info.button;
        var baseInfo = detailOfGame.base_info;
        for(var i = 0; i < this.seats.length; ++i){
           var s = this.seats[i];
           s.seatindex = i;
           s.score = null;
           s.holds = baseInfo.game_seats[i];
           s.pengs = [];
           s.angangs = [];
           s.diangangs = [];
           s.wangangs = [];
           s.folds = [];
           console.log(s);
           if(AppGlobal.vv().userMgr.userId == s.userid){
               this.seatIndex = i;
           }
        }
        this.conf = {
           type:baseInfo.type,
	        difen: 1, // 底分（每局起始分数）int
	        zimo: 1, // 自摸 int
            jiangdui:false,
	        huansanzhang: false, // 换三张 （血流成河打法）
	        zuidafanshu: 4, // 最大蕃数
	        jushuxuanze: 4,
	        dianganghua: 0,
	        menqing: false, // 门清 （自摸)
	        tiandihu: false, // 天地胡
            maxFan: 1,
            maxGames: 10, 
            hsz: false
        }
        if(this.conf.type == null){
           this.conf.type == "xzdd";
        }
    }

    getWanfa () {
        var conf = this.conf;
        if(conf && conf.maxGames!=null && conf.maxFan!=null){
           var strArr = [];
           strArr.push(conf.maxGames + "局");
           strArr.push(conf.maxFan + "番封顶");
           if(conf.hsz){
               strArr.push("换三张");   
           }
           if(conf.zimo == 1){
               strArr.push("自摸加番");
           }
           else{
               strArr.push("自摸加底");
           }
           if(conf.jiangdui){
               strArr.push("将对");   
           }
           if(conf.dianganghua == 1){
               strArr.push("点杠花(自摸)");   
           }
           else{
               strArr.push("点杠花(放炮)");
           }
           if(conf.menqing){
               strArr.push("门清、中张");   
           }
           if(conf.tiandihu){
               strArr.push("天地胡");   
           }
           return strArr.join(" ");
        }
        return "";
    }

    initHandlers () {
        console.log("gamenet mgr init handlers")
        var self = this;
        AppGlobal.vv().net.addHandler("login_result",function(data){
           console.log(data);
           if(data.errcode === 0){
               var data = data.data;
               self.roomId = data.roomid;
               self.conf = data.conf;
               self.maxNumOfGames = data.conf.maxGames;
               self.numOfGames = data.numofgames;
               self.seats = data.seats;
               self.seatIndex = self.getSeatIndexByID(AppGlobal.vv().userMgr.userId);
               self.isOver = false;
           }
           else{
               console.log(data.errmsg);   
           }
           self.dispatchEvent('login_result');
        });
        AppGlobal.vv().net.addHandler("login_finished",function(data){
           console.log("login_finished");
           director.loadScene("mjgame",function(){
               AppGlobal.vv().net.ping();
               AppGlobal.vv().wc.hide();
           });
           self.dispatchEvent("login_finished");
        });
        AppGlobal.vv().net.addHandler("exit_result",function(data){
           self.roomId = null;
           self.turn = -1;
           self.dingque = -1;
           self.isDingQueing = false;
           self.seats = null;
        });
        AppGlobal.vv().net.addHandler("exit_notify_push",function(data){
          var userId = data;
          var s = self.getSeatByID(userId);
          if(s != null){
              s.userid = 0;
              s.name = "";
              self.dispatchEvent("user_state_changed",s);
          }
        });
        AppGlobal.vv().net.addHandler("dispress_push",function(data){
           self.roomId = null;
           self.turn = -1;
           self.dingque = -1;
           self.isDingQueing = false;
           self.seats = null;
        });
        AppGlobal.vv().net.addHandler("disconnect",function(data){
           if(self.roomId == null){
               AppGlobal.vv().wc.show('正在返回游戏大厅');
               director.loadScene("hall");
           }
           else{
               if(self.isOver == false){
                AppGlobal.vv().userMgr.oldRoomId = self.roomId;
                   self.dispatchEvent("disconnect");                    
               }
               else{
                   self.roomId = null;
               }
           }
        });
        AppGlobal.vv().net.addHandler("new_user_comes_push", function(data){
            console.log("new_user_comes_push, data: " )
            console.log(data)

           var seatIndex = data.seatindex;
           var needCheckIp = false;
           if(self.seats[seatIndex].userid > 0){
               self.seats[seatIndex].online = true;
               if(self.seats[seatIndex].ip != data.ip){
                   self.seats[seatIndex].ip = data.ip;
                   needCheckIp = true;
               }
           }
           else{
               data.online = true;
               self.seats[seatIndex] = data;
               needCheckIp = true;
           }
           self.dispatchEvent('new_user',self.seats[seatIndex]);
           if(needCheckIp){
               self.dispatchEvent('check_ip',self.seats[seatIndex]);
           }
        });
        AppGlobal.vv().net.addHandler("user_state_push",function(data){
           var userId = data.userid;
           var seat = self.getSeatByID(userId);
           seat.online = data.online;
           self.dispatchEvent('user_state_changed',seat);
        });
        AppGlobal.vv().net.addHandler("user_ready_push",function(data){
           var userId = data.userid;
           var seat = self.getSeatByID(userId);
           seat.ready = data.ready;
           self.dispatchEvent('user_state_changed',seat);
        });
        AppGlobal.vv().net.addHandler("game_holds_push",function(data){
           var seat = self.seats[self.seatIndex]; 
           console.log(data);
           seat.holds = data;
           for(var i = 0; i < self.seats.length; ++i){
               var s = self.seats[i]; 
               if(s.folds == null){
                   s.folds = [];
               }
               if(s.pengs == null){
                   s.pengs = [];
               }
               if(s.angangs == null){
                   s.angangs = [];
               }
               if(s.diangangs == null){
                   s.diangangs = [];
               }
               if(s.wangangs == null){
                   s.wangangs = [];
               }
               s.ready = false;
           }
           self.dispatchEvent('game_holds');
        });
        AppGlobal.vv().net.addHandler("game_begin_push",function(data){
            console.warn("game begin push")
           console.log('game_action_push');
           console.log(data);
           self.button = data;
           self.turn = self.button;
           self.gamestate = "begin";
           self.dispatchEvent('game_begin');
        });
        AppGlobal.vv().net.addHandler("game_playing_push",function(data){
           console.log('game_playing_push'); 
           self.gamestate = "playing"; 
           self.dispatchEvent('game_playing');
        });
        AppGlobal.vv().net.addHandler("game_sync_push",function(data){
           console.log("game_sync_push");
           console.log(data);
           self.numOfMJ = data.numofmj;
           self.gamestate = data.state;
           console.warn("********** game state: " + self.gamestate);
           
           if(self.gamestate == "dingque"){
               self.isDingQueing = true;
           }
           else if(self.gamestate == "huanpai"){
               self.isHuanSanZhang = true;
           }
           self.turn = data.turn;
           self.button = data.button;
           self.chupai = data.chuPai;
           self.huanpaimethod = data.huanpaimethod;
           for(var i = 0; i < 4; ++i){
               var seat = self.seats[i];
               var sd = data.seats[i];
               seat.holds = sd.holds;
               seat.folds = sd.folds;
               seat.angangs = sd.angangs;
               seat.diangangs = sd.diangangs;
               seat.wangangs = sd.wangangs;
               seat.pengs = sd.pengs;
               seat.dingque = sd.que;
               seat.hued = sd.hued; 
               seat.iszimo = sd.iszimo;
               seat.huinfo = sd.huinfo;
               seat.huanpais = sd.huanpais;
               if(i == self.seatIndex){
                   self.dingque = sd.que;
               }
          }
          self.dispatchEvent('game_sync');
        });
        AppGlobal.vv().net.addHandler("game_dingque_push",function(data){
           self.isDingQueing = true;
           self.isHuanSanZhang = false;
           self.gamestate = 'dingque';
           self.dispatchEvent('game_dingque');
        });
        AppGlobal.vv().net.addHandler("game_huanpai_push",function(data){
           self.isHuanSanZhang = true;
           self.dispatchEvent('game_huanpai');
        });
        AppGlobal.vv().net.addHandler("hangang_notify_push",function(data){
           self.dispatchEvent('hangang_notify',data);
        });
        AppGlobal.vv().net.addHandler("game_action_push",function(data){
           self.curaction = data;
           console.log(data);
           self.dispatchEvent('game_action',data);
        });
        AppGlobal.vv().net.addHandler("game_chupai_push",function(data){
           console.log('game_chupai_push');
           var turnUserID = data;
           var si = self.getSeatIndexByID(turnUserID);
           self.doTurnChange(si);
        });
        AppGlobal.vv().net.addHandler("game_num_push",function(data){
           self.numOfGames = data;
           self.dispatchEvent('game_num',data);
        });
        AppGlobal.vv().net.addHandler("game_over_push",function(data){
           console.log('game_over_push');
           var results = data.results;
           for(var i = 0; i <  self.seats.length; ++i){
               self.seats[i].score = results.length == 0? 0:results[i].totalscore;
           }
           self.dispatchEvent('game_over',results);
           if(data.endinfo){
               self.isOver = true;
               self.dispatchEvent('game_end',data.endinfo);    
           }
           self.reset();
           for(var i = 0; i <  self.seats.length; ++i){
               self.dispatchEvent('user_state_changed',self.seats[i]);    
           }
        });
        AppGlobal.vv().net.addHandler("mj_count_push",function(data){
           console.log('mj_count_push');
           self.numOfMJ = data;
           self.dispatchEvent('mj_count',data);
        });
        AppGlobal.vv().net.addHandler("hu_push",function(data){
           console.log('hu_push');
           console.log(data);
           self.doHu(data);
        });
        AppGlobal.vv().net.addHandler("game_chupai_notify_push",function(data){
           var userId = data.userId;
           var pai = data.pai;
           var si = self.getSeatIndexByID(userId);
           self.doChupai(si,pai);
        });
        AppGlobal.vv().net.addHandler("game_mopai_push",function(data){
           console.log('game_mopai_push');
           self.doMopai(self.seatIndex,data);
        });
        AppGlobal.vv().net.addHandler("guo_notify_push",function(data){
           console.log('guo_notify_push');
           var userId = data.userId;
           var pai = data.pai;
           var si = self.getSeatIndexByID(userId);
           self.doGuo(si,pai);
        });
        AppGlobal.vv().net.addHandler("guo_result",function(data){
           console.log('guo_result');
           self.dispatchEvent('guo_result');
        });
        AppGlobal.vv().net.addHandler("guohu_push",function(data){
           console.log('guohu_push');
           self.dispatchEvent("push_notice",{info:"过胡",time:1.5});
        });
        AppGlobal.vv().net.addHandler("huanpai_notify",function(data){
           var seat = self.getSeatByID(data.si);
           seat.huanpais = data.huanpais;
           self.dispatchEvent('huanpai_notify',seat);
        });
        AppGlobal.vv().net.addHandler("game_huanpai_over_push",function(data){
           console.log('game_huanpai_over_push');
           var info = "";
           var method = data.method;
           if(method == 0){
               info = "换对家牌";
           }
           else if(method == 1){
               info = "换下家牌";
           }
           else{
               info = "换上家牌";
           }
           self.huanpaimethod = method;
           AppGlobal.vv().gameNetMgr.isHuanSanZhang = false;
           self.dispatchEvent("game_huanpai_over");
           self.dispatchEvent("push_notice",{info:info,time:2});
        });
        AppGlobal.vv().net.addHandler("peng_notify_push",function(data){
           console.log('peng_notify_push');
           console.log(data);
           var userId = data.userid;
           var pai = data.pai;
           var si = self.getSeatIndexByID(userId);
           self.doPeng(si,data.pai);
        });
        AppGlobal.vv().net.addHandler("gang_notify_push",function(data){
           console.log('gang_notify_push');
           console.log(data);
           var userId = data.userid;
           var pai = data.pai;
           var si = self.getSeatIndexByID(userId);
           self.doGang(si,pai,data.gangtype);
        });
        AppGlobal.vv().net.addHandler("game_dingque_notify_push",function(data){
           self.dispatchEvent('game_dingque_notify',data);
        });
        AppGlobal.vv().net.addHandler("game_dingque_finish_push",function(data){
           for(var i = 0; i < data.length; ++i){
               self.seats[i].dingque = data[i];
               if(i == self.seatIndex){
                   self.dingque = data[i];
               }
           }
           self.dispatchEvent('game_dingque_finish',data);
        });
        AppGlobal.vv().net.addHandler("chat_push",function(data){
           self.dispatchEvent("chat_push",data);    
        });
        AppGlobal.vv().net.addHandler("quick_chat_push",function(data){
           self.dispatchEvent("quick_chat_push",data);
        });
        AppGlobal.vv().net.addHandler("emoji_push",function(data){
           self.dispatchEvent("emoji_push",data);
        });
        AppGlobal.vv().net.addHandler("dissolve_notice_push",function(data){
           console.log("dissolve_notice_push"); 
           console.log(data);
           self.dissoveData = data;
           self.dispatchEvent("dissolve_notice",data);
        });
        AppGlobal.vv().net.addHandler("dissolve_cancel_push",function(data){
           self.dissoveData = null;
           self.dispatchEvent("dissolve_cancel",data);
        });
        AppGlobal.vv().net.addHandler("voice_msg_push",function(data){
           self.dispatchEvent("voice_msg",data);
        });
    }

    doGuo (seatIndex: any, pai: any) {
        var seatData = this.seats[seatIndex];
        var folds = seatData.folds;
        folds.push(pai);
        this.dispatchEvent('guo_notify',seatData);    
    }

    doMopai (seatIndex: any, pai: any) {
        var seatData = this.seats[seatIndex];
        if(seatData.holds){
           seatData.holds.push(pai);
           this.dispatchEvent('game_mopai',{seatIndex:seatIndex,pai:pai});            
        }
    }

    doChupai (seatIndex: any, pai: any) {
        this.chupai = pai;
        var seatData = this.seats[seatIndex];
        if(seatData.holds){             
           var idx = seatData.holds.indexOf(pai);
           seatData.holds.splice(idx,1);
        }
        this.dispatchEvent('game_chupai_notify',{seatData:seatData,pai:pai});    
    }

    doPeng (seatIndex: any, pai: any) {
        var seatData = this.seats[seatIndex];
        if(seatData.holds){
           for(var i = 0; i < 2; ++i){
               var idx = seatData.holds.indexOf(pai);
               seatData.holds.splice(idx,1);
           }                
        }
        var pengs = seatData.pengs;
        pengs.push(pai);
        this.dispatchEvent('peng_notify',seatData);
    }

    getGangType (seatData: any, pai: any) {
        if(seatData.pengs.indexOf(pai) != -1){
           return "wangang";
        }
        else{
           var cnt = 0;
           for(var i = 0; i < seatData.holds.length; ++i){
               if(seatData.holds[i] == pai){
                   cnt++;
               }
           }
           if(cnt == 3){
               return "diangang";
           }
           else{
               return "angang";
           }
        }
    }

    doGang (seatIndex: number, pai: string, gangtype: any = null) {
        var seatData = this.seats[seatIndex];
        if(!gangtype){
           gangtype = this.getGangType(seatData,pai);
        }
        if(gangtype == "wangang"){
           if(seatData.pengs.indexOf(pai) != -1){
               var idx = seatData.pengs.indexOf(pai);
               if(idx != -1){
                   seatData.pengs.splice(idx,1);
               }
           }
           seatData.wangangs.push(pai);      
        }
        if(seatData.holds){
           for(var i = 0; i <= 4; ++i){
               var idx = seatData.holds.indexOf(pai);
               if(idx == -1){
                   break;
               }
               seatData.holds.splice(idx,1);
           }
        }
        if(gangtype == "angang"){
           seatData.angangs.push(pai);
        }
        else if(gangtype == "diangang"){
           seatData.diangangs.push(pai);
        }
        this.dispatchEvent('gang_notify',{seatData:seatData,gangtype:gangtype});
    }

    doHu (data: any) {
        this.dispatchEvent('hupai',data);
    }

    doTurnChange (si: any) {
        var data = {
           last:this.turn,
           turn:si,
        }
        this.turn = si;
        this.dispatchEvent('game_chupai',data);
    }

    connectGameServer (data: any) {
        this.dissoveData = null;
        AppGlobal.vv().net.ip = data.ip + ":" + data.port;
        console.log(AppGlobal.vv().net.ip,"##################!!!!!!!!!!!!!!!!!!!!!%%%%%%%%%");
        var self = this;
        var onConnectOK = function(){
           console.log("onConnectOK");
           var sd = {
               token:data.token,
               roomid:data.roomid,
               time:data.time,
               sign:data.sign,
           };
           AppGlobal.vv().net.send("login",sd);
        };
        var onConnectFailed = function(){
           console.log("failed.");
           AppGlobal.vv().wc.hide();
        };
        AppGlobal.vv().wc.show("正在进入房间");
        AppGlobal.vv().net.connect(onConnectOK, onConnectFailed);
    }

}
