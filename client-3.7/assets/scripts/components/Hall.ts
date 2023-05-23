import { _decorator, Canvas, Component, director, Label, Node, Sprite, sys, UITransform, utils, Vec3 } from 'cc';
import { Net } from '../Net';
import { Global } from '../Global';
import { AppGlobal } from './AppGlobal';
import { ImageLoader } from './ImageLoader';
import { UserInfoShow } from './UserInfoShow';
const { ccclass, property } = _decorator;

@ccclass('Hall')
export class Hall extends Component {
    @property
    public lblName: Label = null;
    @property
    public lblMoney: Label = null;
    @property
    public lblGems: Label = null;
    @property
    public lblID: Label = null;
    @property
    public lblNotice: Label  = null;
    @property
    public joinGameWin: Node = null;
    @property
    public createRoomWin: Node = null;
    @property
    public settingsWin: Node  = null;
    @property
    public helpWin: Node = null;
    @property
    public xiaoxiWin: Node = null;
    @property
    public btnJoinGame: Node = null;
    @property
    public btnReturnGame: Node = null;
    @property
    public sprHeadImg: Sprite = null;

    initNetHandlers () {
        //var self = this;
    }

    onShare () {
        AppGlobal.vv().anysdkMgr.share("天天麻将","天天麻将，包含了血战到底、血流成河等多种四川流行麻将玩法。");   
    }

    onLoad () {
        // director.setDisplayStats(false);
        if(!sys.isNative && sys.isMobile){
        //    var cvs = this.node.getComponent(Canvas);
        //    cvs.fitHeight = true;
        //    cvs.fitWidth = true;
        }
        if(!AppGlobal.vv()){
           director.loadScene("loading");
           return;
        }
        this.initLabels();

        if(AppGlobal.vv().gameNetMgr.roomId == null){
           this.btnJoinGame.active = true;
           this.btnReturnGame.active = false;
        }
        else{
           this.btnJoinGame.active = false;
           this.btnReturnGame.active = true;
        }
        var roomId = AppGlobal.vv().userMgr.oldRoomId 
        if( roomId != null){
            AppGlobal.vv().userMgr.oldRoomId = null;
            AppGlobal.vv().userMgr.enterRoom(roomId);
        }
        var imgLoader = this.sprHeadImg.node.getComponent(ImageLoader);
        imgLoader.setUserID(AppGlobal.vv().userMgr.userId);
        AppGlobal.vv().utils.addClickEvent(this.sprHeadImg.node,this.node,"Hall","onBtnClicked");
        this.addComponent(UserInfoShow);
        this.initButtonHandler("right_bottom/btn_shezhi");
        this.initButtonHandler("right_bottom/btn_help");
        this.initButtonHandler("right_bottom/btn_xiaoxi");
        this.helpWin.addComponent("OnBack");
        this.xiaoxiWin.addComponent("OnBack");
        if(!AppGlobal.vv().userMgr.notice){
            AppGlobal.vv().userMgr.notice = {
               version:null,
               msg:"数据请求中...",
           }
        }
        if(!AppGlobal.vv().userMgr.gemstip){
            AppGlobal.vv().userMgr.gemstip = {
               version:null,
               msg:"数据请求中...",
           }
        }
        this.lblNotice.string = AppGlobal.vv().userMgr.notice.msg;
        this.refreshInfo();
        this.refreshNotice();
        this.refreshGemsTip();
        AppGlobal.vv().audioMgr.playBGM("bgMain.mp3");
        AppGlobal.vv().utils.addEscEvent(this.node);
    }

    refreshInfo () {
        var self = this;
        var onGet = (ret) => {
           if(ret.errcode !== 0){
               console.log(ret.errmsg);
           }
           else{
               if(ret.gems != null){
                   this.lblGems.string = ret.gems;    
               }
           }
        };
        var data = {
           account: AppGlobal.vv().userMgr.account,
           sign: AppGlobal.vv().userMgr.sign,
           salt: AppGlobal.vv().userMgr.salt || ""
        };
        AppGlobal.vv().http.sendRequest("/get_user_status",data,onGet.bind(this));
    }

    refreshGemsTip () {
        console.log("--------- in the hall, the mgr data: " )
        console.log(AppGlobal.vv().userMgr)
        if(AppGlobal.vv().userMgr.salt === "") {
            console.log("&&&&&&&&&& no salt - return")
            return
        }
        var self = this;
        var onGet = (ret) => {
           if(ret.errcode !== 0){
               console.log(ret.errmsg);
           } else {
            AppGlobal.vv().userMgr.gemstip.version = ret.version;
            AppGlobal.vv().userMgr.gemstip.msg = ret.msg.replace("<newline>","\n");
           }
        };
        var data = {
           account: AppGlobal.vv().userMgr.account,
           sign: AppGlobal.vv().userMgr.sign,
           type: "fkgm",
           version: AppGlobal.vv().userMgr.gemstip.version,
           salt: AppGlobal.vv().userMgr.salt || ""
        };
        AppGlobal.vv().http.sendRequest("/get_message",data,onGet.bind(this));
    }

    refreshNotice () {
        var self = this;
        var onGet = (ret) => {
           if(ret.errcode !== 0){
               console.log(ret.errmsg);
           }
           else{
            AppGlobal.vv().userMgr.notice.version = ret.version;
            AppGlobal.vv().userMgr.notice.msg = ret.msg;
            this.lblNotice.string = ret.msg;
           }
        };
        var data = {
           account: AppGlobal.vv().userMgr.account,
           sign: AppGlobal.vv().userMgr.sign,
           type: "notice",
           version: AppGlobal.vv().userMgr.notice.version,
           salt: AppGlobal.vv().userMgr.salt
        };
        AppGlobal.vv().http.sendRequest("/get_message",data,onGet.bind(this));
    }

    initButtonHandler (btnPath: any) {
        var btn = utils.find(btnPath, this.node);
        AppGlobal.vv().utils.addClickEvent(btn,this.node,"Hall","onBtnClicked");        
    }

    initLabels () {
        this.lblName.string = AppGlobal.vv().userMgr.userName;
        this.lblMoney.string = AppGlobal.vv().userMgr.coins;
        this.lblGems.string = AppGlobal.vv().userMgr.gems;
        this.lblID.string = "ID:" + AppGlobal.vv().userMgr.userId;
    }

    onBtnClicked (event: any) {
        if(event.target.name == "btn_shezhi"){
           this.settingsWin.active = true;
        }   
        else if(event.target.name == "btn_help"){
           this.helpWin.active = true;
        }
        else if(event.target.name == "btn_xiaoxi"){
           this.xiaoxiWin.active = true;
        }
        else if(event.target.name == "head"){
            AppGlobal.vv().userinfoShow.show(AppGlobal.vv().userMgr.userName, 
                AppGlobal.vv().userMgr.userId,
                this.sprHeadImg, 
                AppGlobal.vv().userMgr.sex,
                AppGlobal.vv().userMgr.ip);
        }
    }

    onJoinGameClicked () {
        this.joinGameWin.active = true;
    }

    onReturnGameClicked () {
        AppGlobal.vv().wc.show('正在返回游戏房间');
        director.loadScene("mjgame");  
    }

    onBtnAddGemsClicked () {
        AppGlobal.vv().alert.show("提示", AppGlobal.vv().userMgr.gemstip.msg, function() {
           this.onBtnTaobaoClicked();
        }.bind(this));
        this.refreshInfo();
    }

    onCreateRoomClicked () {
        if(AppGlobal.vv().gameNetMgr.roomId != null){
            AppGlobal.vv().alert.show("提示","房间已经创建!\n必须解散当前房间才能创建新的房间");
           return;
        }
        console.log("onCreateRoomClicked");
        this.createRoomWin.active = true;   
    }

    onBtnTaobaoClicked () {
        sys.openURL('https://shop596732896.taobao.com/');
    }

    update (dt: any) {
        var x = this.lblNotice.node.position.x;
        x -= dt*100;
        if(x + this.lblNotice.node.getComponent(UITransform).width < -1000){
           x = 500;
        }
        const position = this.lblNotice.node.position;
        const newPosition = new Vec3(x, position.y, position.z)

        this.lblNotice.node.setPosition(newPosition);
        if(AppGlobal.vv() && AppGlobal.vv().userMgr.roomData != null){
            AppGlobal.vv().userMgr.enterRoom(AppGlobal.vv().userMgr.roomData);
            AppGlobal.vv().userMgr.roomData = null;
        }
    }
}
