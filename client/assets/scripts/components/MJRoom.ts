import { _decorator, Component, director, Label, utils } from 'cc';
import { AppGlobal } from './AppGlobal';
import { PlayerHolds } from '../GameNetMgr';
const { ccclass, property } = _decorator;

@ccclass('MJRoom')
export class MJRoom extends Component {
    @property(Label)
    public lblRoomNo: Label
    private _seats = [];
    private _seats2 = [];
    private _timeLabel: Label = null
    private _voiceMsgQueue = [];
    private _lastPlayingSeat: Node = null;
    private _playingSeat = null;
    private _lastPlayTime = null;
    private _lastMinute: number = 0

    onLoad () {
        if(AppGlobal.vv() == null){
           return;
        }
        this.initView();
        this.initSeats();
        this.initEventHandlers();
    }

    initView () {
        var prepare = this.node.getChildByName("prepare");
        var seats = prepare.getChildByName("seats");
        for(var i = 0; i < seats.children.length; ++i){
           this._seats.push(seats.children[i].getComponent("Seat"));
        }
        this.refreshBtns();
        this.lblRoomNo = utils.find("infobar/Z_room_txt/New Label", this.node).getComponent(Label);
        this._timeLabel = utils.find("infobar/time", this.node).getComponent(Label);
        this.lblRoomNo.string = AppGlobal.vv().gameNetMgr.roomId;
        var gameChild = this.node.getChildByName("game");
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
           var sideNode = gameChild.getChildByName(sides[i]);
           var seat = sideNode.getChildByName("seat");
           this._seats2.push(seat.getComponent("Seat"));
        }
        var btnWechat = utils.find("prepare/btnWeichat", this.node);
        if(btnWechat){
            AppGlobal.vv().utils.addClickEvent(btnWechat, this.node, MJRoom, "onBtnWeichatClicked");
        }
        var titles = utils.find("typeTitle", this.node);
        for(var i = 0; i < titles.children.length; ++i){
           titles.children[i].active = false;
        }
        if(AppGlobal.vv().gameNetMgr.conf){
           var type = AppGlobal.vv().gameNetMgr.conf.type;
           if(type == null || type == ""){
               type = "xzdd";
           }
           titles.getChildByName(type).active = true;   
        }
    }

    refreshBtns () {
        var prepare = this.node.getChildByName("prepare");
        var btnExit = prepare.getChildByName("btnExit");
        var btnDispress = prepare.getChildByName("btnDissolve");
        var btnWeichat = prepare.getChildByName("btnWeichat");
        var btnBack = prepare.getChildByName("btnBack");
        var isIdle = AppGlobal.vv().gameNetMgr.numOfGames == 0;
        btnExit.active = !AppGlobal.vv().gameNetMgr.isOwner() && isIdle;
        btnDispress.active = AppGlobal.vv().gameNetMgr.isOwner() && isIdle;
        btnWeichat.active = isIdle;
        btnBack.active = isIdle;
    }

    initEventHandlers () {
        var self = this;
        this.node.on('new_user',function(data){
           self.initSingleSeat(data);
        });
        this.node.on('user_state_changed',function(data){
           self.initSingleSeat(data);
        });
        this.node.on('game_begin',function(data){
            console.log("********* game begin event")
           self.refreshBtns();
           self.initSeats();
        });
        this.node.on('game_num',function(data){
           self.refreshBtns();
        });
        this.node.on('game_huanpai',function(data){
           for(var i in self._seats2){
               self._seats2[i].refreshXuanPaiState();    
           }
        });
        this.node.on('huanpai_notify',function(data){
           var idx = data.detail.seatindex;
           var localIdx = AppGlobal.vv().gameNetMgr.getLocalIndex(idx);
           self._seats2[localIdx].refreshXuanPaiState();
        });
        this.node.on('game_huanpai_over',function(data){
           for(var i in self._seats2){
               self._seats2[i].refreshXuanPaiState();    
           }
        });
        this.node.on('voice_msg',function(data){
           var data = data.detail;
           self._voiceMsgQueue.push(data);
           self.playVoice();
        });
        this.node.on('chat_push',function(data){
           var data = data.detail;
           var idx = AppGlobal.vv().gameNetMgr.getSeatIndexByID(data.sender);
           var localIdx = AppGlobal.vv().gameNetMgr.getLocalIndex(idx);
           self._seats[localIdx].chat(data.content);
           self._seats2[localIdx].chat(data.content);
        });
        this.node.on('quick_chat_push',function(data){
           var data = data.detail;
           var idx = AppGlobal.vv().gameNetMgr.getSeatIndexByID(data.sender);
           var localIdx = AppGlobal.vv().gameNetMgr.getLocalIndex(idx);
           var index = data.content;
           var info = AppGlobal.vv().chat.getQuickChatInfo(index);
           self._seats[localIdx].chat(info.content);
           self._seats2[localIdx].chat(info.content);
           AppGlobal.vv().audioMgr.playSFX(info.sound);
        });
        this.node.on('emoji_push',function(data){
           var data = data.detail;
           var idx = AppGlobal.vv().gameNetMgr.getSeatIndexByID(data.sender);
           var localIdx = AppGlobal.vv().gameNetMgr.getLocalIndex(idx);
           console.log(data);
           self._seats[localIdx].emoji(data.content);
           self._seats2[localIdx].emoji(data.content);
        });
    }

    initSeats () {
        var seats = AppGlobal.vv().gameNetMgr.seats;
        for(var i = 0; i < seats.length; ++i){
           this.initSingleSeat(seats[i]);
        }
    }

    initSingleSeat (seat: PlayerHolds) {
        var index = AppGlobal.vv().gameNetMgr.getLocalIndex(seat.seatindex);
        var isOffline = !seat.online;
        var isZhuang = seat.seatindex == AppGlobal.vv().gameNetMgr.button;
        console.log("isOffline:" + isOffline);
        this._seats[index].setInfo(seat.name,seat.score);
        this._seats[index].setReady(seat.ready);
        this._seats[index].setOffline(isOffline);
        this._seats[index].setID(seat.userid);
        this._seats[index].voiceMsg(false);
        this._seats2[index].setInfo(seat.name,seat.score);
        this._seats2[index].setZhuang(isZhuang);
        this._seats2[index].setOffline(isOffline);
        this._seats2[index].setID(seat.userid);
        this._seats2[index].voiceMsg(false);
        this._seats2[index].refreshXuanPaiState();
    }

    onBtnSettingsClicked () {
        AppGlobal.vv().popupMgr.showSettings();   
    }

    onBtnBackClicked () {
        AppGlobal.vv().alert.show("返回大厅","返回大厅房间仍会保留，快去邀请大伙来玩吧！",function(){
            AppGlobal.vv().wc.show('正在返回游戏大厅');
           director.loadScene("hall");    
        },true);
    }

    onBtnChatClicked () {
    }

    onBtnWeichatClicked () {
        var title = "<血战到底>";
        if(AppGlobal.vv().gameNetMgr.conf.type == "xlch"){
           var title = "<血流成河>";
        }
        // AppGlobal.vv().anysdkMgr.share("天天麻将" + title,"房号:" + AppGlobal.vv().gameNetMgr.roomId + " 玩法:" + AppGlobal.vv().gameNetMgr.getWanfa());
    }

    onBtnDissolveClicked () {
        AppGlobal.vv().alert.show("解散房间","解散房间不扣房卡，是否确定解散？",function(){
            AppGlobal.vv().net.send("dispress");    
        },true);
    }

    onBtnExit () {
        AppGlobal.vv().net.send("exit");
    }

    playVoice () {
        if(this._playingSeat == null && this._voiceMsgQueue.length){
           console.log("playVoice2");
           var data = this._voiceMsgQueue.shift();
           var idx = AppGlobal.vv().gameNetMgr.getSeatIndexByID(data.sender);
           var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(idx);
           this._playingSeat = localIndex;
           this._seats[localIndex].voiceMsg(true);
           this._seats2[localIndex].voiceMsg(true);
           var msgInfo = JSON.parse(data.content);
           var msgfile = "voicemsg.amr";
           console.log(msgInfo.msg.length);
           AppGlobal.vv().voiceMgr.writeVoice(msgfile,msgInfo.msg);
           AppGlobal.vv().voiceMgr.play(msgfile);
           this._lastPlayTime = Date.now() + msgInfo.time;
        }
    }

    update (dt: any) {
        var minutes = Math.floor(Date.now()/1000/60);
        if(this._lastMinute != minutes){
           this._lastMinute = minutes;
           var date = new Date();
           var h = ("00" + date.getHours().toString()).slice(-2);
           var m = ("00" + date.getMinutes()).slice(-2);
           this._timeLabel.string = "" + h + ":" + m;             
        }
        if(this._lastPlayTime != null){
           if(Date.now() > this._lastPlayTime + 200){
               this.onPlayerOver();
               this._lastPlayTime = null;    
           }
        }
        else{
           this.playVoice();
        }
    }

    onPlayerOver () {
        AppGlobal.vv().audioMgr.resumeAll();
        console.log("onPlayCallback:" + this._playingSeat);
        var localIndex = this._playingSeat;
        this._playingSeat = null;
        this._seats[localIndex].voiceMsg(false);
        this._seats2[localIndex].voiceMsg(false);
    }

    onDestroy () {
        AppGlobal.vv().voiceMgr.stop();
    }

}