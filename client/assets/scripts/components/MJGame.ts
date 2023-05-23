import { _decorator, Button, Animation, Component, director, Label, Node, Sprite, sys, Event, SystemEvent, utils, view } from 'cc';
import { AppGlobal } from './AppGlobal';
import { NoticeTip } from './NoticeTip';
import { GameOver } from './GameOver';
import { DingQue } from './DingQue';
import { PengGangs } from './PengGangs';
import { MJRoom } from './MJRoom';
import { TimePointer } from './TimePointer';
import { GameResult } from './GameResult';
import { Chat } from './Chat';
import { Folds } from './Folds';
import { ReplayCtrl } from './ReplayCtrl';
import { PopupMgr } from './PopupMgr';
import { HuanSanZhang } from './HuanSanZhang';
import { ReConnect } from './ReConnect';
import { Voice } from './Voice';
import { UserInfoShow } from './UserInfoShow';
import { Status } from './Status';
const { ccclass, property } = _decorator;


type MJDef = {
    mjId: number;
    y: number;
}

@ccclass('MJGame')
export class MJGame extends Component {
    @property(Node)
    public gameRoot: Node = null;
    @property
    public prepareRoot:Node;
    
    private _myMJArr: Sprite[] = [];
    private _options: Node = null
    private _selectedMJ: Node = null
    private _chupaiSprite = [];
    private _mjcount: Label = null
    private _gamecount: Label = null
    private _hupaiTips: Node[] = [];
    private _hupaiLists: Node[] = [];
    private _playEfxs: Animation[] = [];
    private _opts = [];
    private _chupaidrag: Node = null

    onLoad () {
        if(!sys.isNative && sys.isMobile){
        //    var cvs = this.node.getComponent(Canvas);
        //    cvs.fitHeight = true;
        //    cvs.fitWidth = true;
        }
        if(!AppGlobal.vv()){
           director.loadScene("loading");
           return;
        }
        this.addComponent(NoticeTip);
        this.addComponent(GameOver);
        // this.addComponent(DingQue); // move to the UI, just been easier to associate the events
        this.addComponent(PengGangs);
        // this.addComponent(MJRoom); // move into the UI 
        this.addComponent(TimePointer);
        this.addComponent(GameResult);
        this.addComponent(Chat);
        this.addComponent(Folds);
        this.addComponent(ReplayCtrl);
        this.addComponent(PopupMgr);
        this.addComponent(HuanSanZhang);
        this.addComponent(ReConnect);
        // this.addComponent(Voice);
        this.addComponent(UserInfoShow);
        // this.addComponent(Status); // move to the scene UI
        this.initView();
        this.initEventHandlers();
        this.gameRoot.active = false;
        this.prepareRoot.active = true;
        this.initWanfaLabel();
        this.onGameBeign();
        AppGlobal.vv().audioMgr.playBGM("bgFight.mp3");
        AppGlobal.vv().utils.addEscEvent(this.node);
    }

    initView () {
        var gameChild = this.node.getChildByName("game");
        this._mjcount = gameChild.getChildByName('mjcount').getComponent(Label);
        this._mjcount.string = "剩余" + AppGlobal.vv().gameNetMgr.numOfMJ + "张";
        this._gamecount = gameChild.getChildByName('gamecount').getComponent(Label);
        this._gamecount.string = "" + AppGlobal.vv().gameNetMgr.numOfGames + "/" + AppGlobal.vv().gameNetMgr.maxNumOfGames + "局";
        var myselfChild = gameChild.getChildByName("myself");
        var myholds = myselfChild.getChildByName("holds");
        this._chupaidrag = gameChild.getChildByName('chupaidrag');
        this._chupaidrag.active = false;
        for(var i = 0; i < myholds.children.length; ++i){
           var sprite = myholds.children[i].getComponent(Sprite);
           const button = myholds.children[i].getComponent(Button)
           button.interactable = true
           this._myMJArr.push(sprite);
           sprite.spriteFrame = null;
           this.initDragStuffs(sprite.node);
        }
        var realwidth = view.getVisibleSize().width;
        AppGlobal.vv().utils.setScale(myholds, {x: realwidth / 1280, y: realwidth / 1280})

        
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
           var side = sides[i];
           var sideChild = gameChild.getChildByName(side);
           this._hupaiTips.push(sideChild.getChildByName("HuPai"));
           this._hupaiLists.push(sideChild.getChildByName("hupailist"));
           this._playEfxs.push(sideChild.getChildByName("play_efx").getComponent(Animation));
           this._chupaiSprite.push(sideChild.getChildByName("ChuPai").children[0].getComponent(Sprite));
           var opt = sideChild.getChildByName("opt");
           opt.active = false;
           var sprite = opt.getChildByName("pai").getComponent(Sprite);
           var data = {
               node:opt,
               sprite:sprite
           };
           this._opts.push(data);
        }
        var opts = gameChild.getChildByName("ops");
        this._options = opts;
        this.hideOptions(null);
        this.hideChupai();
    }

    start () {
        this.checkIp();
    }

    checkIp () {
        if(AppGlobal.vv().gameNetMgr.gamestate == ''){
           return;
        }
        var selfData = AppGlobal.vv().gameNetMgr.getSelfData();
        var ipMap = {}
        for(var i = 0; i < AppGlobal.vv().gameNetMgr.seats.length; ++i){
           var seatData = AppGlobal.vv().gameNetMgr.seats[i];
           if(seatData.ip != null && seatData.userid > 0 && seatData != selfData){
               if(ipMap[seatData.ip]){
                   ipMap[seatData.ip].push(seatData.name);
               }
               else{
                   ipMap[seatData.ip] = [seatData.name];
               }
           }
        }
        for(var k in ipMap){
           var d = ipMap[k];
           if(d.length >= 2){
               var str = "" + d.join("\n") + "\n\n正在使用同一IP地址进行游戏!";
               AppGlobal.vv().alert.show("注意",str);
               return; 
           }
        }
    }

    initDragStuffs (node: any) {
        node.on(SystemEvent.EventType.TOUCH_START, function (event) {
           console.log("cc.Node.EventType.TOUCH_START");
           if (AppGlobal.vv().gameNetMgr.turn != AppGlobal.vv().gameNetMgr.seatIndex) {
               return;
           }
           node.interactable = node.getComponent(Button).interactable;
           if (!node.interactable) {
               return;
           }
           node.opacity = 255;
           this._chupaidrag.active = false;
           this._chupaidrag.getComponent(Sprite).spriteFrame = node.getComponent(Sprite).spriteFrame;
           this._chupaidrag.x = event.getLocationX() - view.getVisibleSize().width / 2;
           this._chupaidrag.y = event.getLocationY() - view.getVisibleSize().height / 2;
        }.bind(this));
        node.on(SystemEvent.EventType.TOUCH_MOVE, function (event) {
           console.log("cc.Node.EventType.TOUCH_MOVE");
           if (AppGlobal.vv().gameNetMgr.turn != AppGlobal.vv().gameNetMgr.seatIndex) {
               return;
           }
           if (!node.interactable) {
               return;
           }
           if (Math.abs(event.getDeltaX()) + Math.abs(event.getDeltaY()) < 0.5) {
               return;
           }
           this._chupaidrag.active = true;
           node.opacity = 150;
           this._chupaidrag.opacity = 255;
           this._chupaidrag.scaleX = 1;
           this._chupaidrag.scaleY = 1;
           this._chupaidrag.x = event.getLocationX() - view.getVisibleSize().width / 2;
           this._chupaidrag.y = event.getLocationY() - view.getVisibleSize().height / 2;
           node.y = 0;
        }.bind(this));
        node.on(SystemEvent.EventType.TOUCH_END, function (event) {
           if (AppGlobal.vv().gameNetMgr.turn != AppGlobal.vv().gameNetMgr.seatIndex) {
               return;
           }
           if (!node.interactable) {
               return;
           }
           console.log("cc.Node.EventType.TOUCH_END");
           this._chupaidrag.active = false;
           node.opacity = 255;
           if (event.getLocationY() >= 200) {
               this.shoot(node.mjId);
           }
        }.bind(this));
        node.on(SystemEvent.EventType.TOUCH_CANCEL, function (event) {
           if (AppGlobal.vv().gameNetMgr.turn != AppGlobal.vv().gameNetMgr.seatIndex) {
               return;
           }
           if (!node.interactable) {
               return;
           }
           console.log("cc.Node.EventType.TOUCH_CANCEL");
           this._chupaidrag.active = false;
           node.opacity = 255;
           if (event.getLocationY() >= 200) {
               this.shoot(node.mjId);
           } else if (event.getLocationY() >= 150) {
           }
        }.bind(this));
    }

    hideChupai () {
        for(var i = 0; i < this._chupaiSprite.length; ++i){
           this._chupaiSprite[i].node.active = false;
        }        
    }

    initEventHandlers () {
        console.warn("*************** check this handler, may not work")
        AppGlobal.vv().gameNetMgr.dataEventHandler = this.node.eventProcessor;
        var self = this;
        this.node.on('game_holds',function(data){
          self.initMahjongs();
          self.checkQueYiMen();
        });
        this.node.on('game_begin',function(data){
           self.onGameBeign();
           if(AppGlobal.vv().gameNetMgr.numOfGames == 1){
               self.checkIp();
           }
        });
        this.node.on('check_ip',function(data){
           self.checkIp();
        });
        this.node.on('game_sync',function(data){
           self.onGameBeign();
           self.checkIp();
        });
        this.node.on('game_chupai',function(data){
           data = data;
           self.hideChupai();
           self.checkQueYiMen();
           if(data.last != AppGlobal.vv().gameNetMgr.seatIndex){
               self.initMopai(data.last,null);   
           }
           if(!AppGlobal.vv().replayMgr.isReplay() && data.turn != AppGlobal.vv().gameNetMgr.seatIndex){
               self.initMopai(data.turn,-1);
           }
        });
        this.node.on('game_mopai',function(data){
           self.hideChupai();
           data = data;
           var pai = data.pai;
           var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(data.seatIndex);
           if(localIndex == 0){
               var index = 13;
               var sprite = self._myMJArr[index];
               self.setSpriteFrameByMJID("M_",sprite,pai);
               (sprite.node as any).mjId = pai;                
           }
           else if(AppGlobal.vv().replayMgr.isReplay()){
               self.initMopai(data.seatIndex,pai);
           }
        });
        this.node.on('game_action',function(data){
           self.showAction(data);
        });
        this.node.on('hupai',function(data){
           var data = data;
           var seatIndex = data.seatindex;
           var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(seatIndex);
           var hupai = self._hupaiTips[localIndex];
           hupai.active = true;
           if(localIndex == 0){
               self.hideOptions(null);
           }
           var seatData = AppGlobal.vv().gameNetMgr.seats[seatIndex];
           seatData.hued = true;
           if(AppGlobal.vv().gameNetMgr.conf.type == "xlch"){
               hupai.getChildByName("sprHu").active = true;
               hupai.getChildByName("sprZimo").active = false;
               self.initHupai(localIndex,data.hupai);
               if(data.iszimo){
                   if(seatData.seatindex == AppGlobal.vv().gameNetMgr.seatIndex){
                       seatData.holds.pop();
                       self.initMahjongs();                
                   }
                   else{
                       self.initOtherMahjongs(seatData);
                   }
               } 
           }
           else{
               hupai.getChildByName("sprHu").active = !data.iszimo;
               hupai.getChildByName("sprZimo").active = data.iszimo;
               if(!(data.iszimo && localIndex==0))
               {
                   self.initMopai(seatIndex,data.hupai);
               }                                         
           }
           if(AppGlobal.vv().replayMgr.isReplay() == true && AppGlobal.vv().gameNetMgr.conf.type != "xlch"){
               var opt = self._opts[localIndex];
               opt.node.active = true;
               opt.sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID("M_",data.hupai);                
           }
           if(data.iszimo){
               self.playEfx(localIndex,"play_zimo");    
           }
           else{
               self.playEfx(localIndex,"play_hu");
           }
           AppGlobal.vv().audioMgr.playSFX("nv/hu.mp3");
        });
        this.node.on('mj_count',function(data){
           self._mjcount.string = "剩余" + AppGlobal.vv().gameNetMgr.numOfMJ + "张";
        });
        this.node.on('game_num',function(data){
           self._gamecount.string = "" + AppGlobal.vv().gameNetMgr.numOfGames + "/" + AppGlobal.vv().gameNetMgr.maxNumOfGames + "局";
        });
        this.node.on('game_over',function(data){
           self.gameRoot.active = false;
           self.prepareRoot.active = true;
        });
        this.node.on('game_chupai_notify',function(data){
           self.hideChupai();
           var seatData = data.seatData;
           if(seatData.seatindex == AppGlobal.vv().gameNetMgr.seatIndex){
               self.initMahjongs();                
           }
           else{
               self.initOtherMahjongs(seatData);
           }
           self.showChupai();
           var audioUrl = AppGlobal.vv().mahjongmgr.getAudioURLByMJID(data.pai);
           AppGlobal.vv().audioMgr.playSFX(audioUrl);
        });
        this.node.on('guo_notify',function(data){
           self.hideChupai();
           self.hideOptions(null);
           var seatData = data;
           if(seatData.seatindex == AppGlobal.vv().gameNetMgr.seatIndex){
               self.initMahjongs();                
           }
           AppGlobal.vv().audioMgr.playSFX("give.mp3");
        });
        this.node.on('guo_result',function(data){
           self.hideOptions(null);
        });
        this.node.on('game_dingque_finish',function(data){
           self.initMahjongs();
        });
        this.node.on('peng_notify',function(data){    
           self.hideChupai();
           var seatData = data;
           if(seatData.seatindex == AppGlobal.vv().gameNetMgr.seatIndex){
               self.initMahjongs();                
           }
           else{
               self.initOtherMahjongs(seatData);
           }
           var localIndex = self.getLocalIndex(seatData.seatindex);
           self.playEfx(localIndex,"play_peng");
           AppGlobal.vv().audioMgr.playSFX("nv/peng.mp3");
           self.hideOptions(null);
        });
        this.node.on('gang_notify',function(data){
           self.hideChupai();
           var data = data;
           var seatData = data.seatData;
           var gangtype = data.gangtype;
           if(seatData.seatindex == AppGlobal.vv().gameNetMgr.seatIndex){
               self.initMahjongs();                
           }
           else{
               self.initOtherMahjongs(seatData);
           }
           var localIndex = self.getLocalIndex(seatData.seatindex);
           if(gangtype == "wangang"){
               self.playEfx(localIndex,"play_guafeng");
               AppGlobal.vv().audioMgr.playSFX("guafeng.mp3");
           }
           else{
               self.playEfx(localIndex,"play_xiayu");
               AppGlobal.vv().audioMgr.playSFX("rain.mp3");
           }
        });
        this.node.on("hangang_notify",function(data){
           var localIndex = self.getLocalIndex(data);
           self.playEfx(localIndex,"play_gang");
           AppGlobal.vv().audioMgr.playSFX("nv/gang.mp3");
           self.hideOptions(null);
        });
        this.node.on('login_result', function () {
           self.gameRoot.active = false;
           self.prepareRoot.active = true;
           console.log('login_result');
        });
    }

    showChupai () {
        var pai = AppGlobal.vv().gameNetMgr.chupai; 
        if( pai >= 0 ){
           var localIndex = this.getLocalIndex(AppGlobal.vv().gameNetMgr.turn);
           var sprite = this._chupaiSprite[localIndex];
           sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID("M_",pai);
           sprite.node.active = true;   
        }
    }

    addOption (btnName: any, pai: any) {
        for(var i = 0; i < this._options.children.length; ++i){
           var child = this._options.children[i]; 
           if(child.name == "op" && child.active == false){
               child.active = true;
               var sprite = child.getChildByName("opTarget").getComponent(Sprite);
               sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID("M_",pai);
               var btn = child.getChildByName(btnName); 
               btn.active = true;
               (btn as any).pai = pai;
               return;
           }
        }
    }

    hideOptions (data: any) {
        this._options.active = false;
        for(var i = 0; i < this._options.children.length; ++i){
           var child = this._options.children[i]; 
           if(child.name == "op"){
               child.active = false;
               child.getChildByName("btnPeng").active = false;
               child.getChildByName("btnGang").active = false;
               child.getChildByName("btnHu").active = false;
           }
        }
    }

    showAction (data: any) {
        if(this._options.active){
           this.hideOptions(null);
        }
        if(data && (data.hu || data.gang || data.peng)){
           this._options.active = true;
           if(data.hu){
               this.addOption("btnHu",data.pai);
           }
           if(data.peng){
               this.addOption("btnPeng",data.pai);
           }
           if(data.gang){
               for(var i = 0; i < data.gangpai.length;++i){
                   var gp = data.gangpai[i];
                   this.addOption("btnGang",gp);
               }
           }   
        }
    }

    initWanfaLabel () {
        var wanfa = utils.find("infobar/wanfa", this.node).getComponent(Label);
        wanfa.string = AppGlobal.vv().gameNetMgr.getWanfa();
    }

    initHupai (localIndex: any, pai: any) {
        if(AppGlobal.vv().gameNetMgr.conf.type == "xlch"){
           var hupailist = this._hupaiLists[localIndex];
           for(var i = 0; i < hupailist.children.length; ++i){
               var hupainode = hupailist.children[i]; 
               if(hupainode.active == false){
                   var pre = AppGlobal.vv().mahjongmgr.getFoldPre(localIndex);
                   hupainode.getComponent(Sprite).spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID(pre,pai);
                   hupainode.active = true;
                   break;
               }
           }   
        }
    }

    playEfx (index: any, name: any) {
        this._playEfxs[index].node.active = true;
        this._playEfxs[index].play(name);
    }

    onGameBeign () {
        console.log("on game begin !!!!!!!!")
        for(var i = 0; i < this._playEfxs.length; ++i){
           this._playEfxs[i].node.active = false;
        }
        for(var i = 0; i < this._hupaiLists.length; ++i){
           for(var j = 0; j < this._hupaiLists[i].children.length; ++j){
               this._hupaiLists[i].children[j].active = false;
           }
        }
        for(var i = 0; i < AppGlobal.vv().gameNetMgr.seats.length; ++i){
           var seatData = AppGlobal.vv().gameNetMgr.seats[i];
           var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(i);        
           var hupai = this._hupaiTips[localIndex];
           hupai.active = seatData.hued;
           if(seatData.hued){
               hupai.getChildByName("sprHu").active = !seatData.iszimo;
               hupai.getChildByName("sprZimo").active = seatData.iszimo;
           }
           if(seatData.huinfo){
               for(var j = 0; j < seatData.huinfo.length; ++j){
                   var info = seatData.huinfo[j];
                   if(info.ishupai){
                       this.initHupai(localIndex,info.pai);    
                   }
               }
           }
        }
        this.hideChupai();
        this.hideOptions(null);
        var sides = ["right","up","left"];        
        var gameChild = this.node.getChildByName("game");
        for(let i = 0; i < sides.length; ++i){
           var sideChild = gameChild.getChildByName(sides[i]);
           var holds = sideChild.getChildByName("holds");
           for(var j = 0; j < holds.children.length; ++j){
               var nc = holds.children[j];
               nc.active = true;
               AppGlobal.vv().utils.setScale(nc, {x: 1.0, y: 1.0})
               var sprite = nc.getComponent(Sprite); 
               sprite.spriteFrame = AppGlobal.vv().mahjongmgr.holdsEmpty[i+1];
           }            
        }
        if(AppGlobal.vv().gameNetMgr.gamestate == "" && AppGlobal.vv().replayMgr.isReplay() == false){
           return;
        }
        this.gameRoot.active = true;
        this.prepareRoot.active = false;
        this.initMahjongs();
        var seats = AppGlobal.vv().gameNetMgr.seats;
        for(let i = 0; i < seats.length; i ++) {
           var seatData = seats[i];
           var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(i);
           if(localIndex != 0){
               this.initOtherMahjongs(seatData);
               if(i == AppGlobal.vv().gameNetMgr.turn){
                   this.initMopai(i,-1);
               }
               else{
                   this.initMopai(i,null);    
               }
           }
        }
        this.showChupai();
        if(AppGlobal.vv().gameNetMgr.curaction != null){
           this.showAction(AppGlobal.vv().gameNetMgr.curaction);
           AppGlobal.vv().gameNetMgr.curaction = null;
        }
        this.checkQueYiMen();
    }

    onMJClicked (event: Event, customData: string) {
        console.log("mj clicked ******")
        if(AppGlobal.vv().gameNetMgr.isHuanSanZhang){
           this.node.emit("mj_clicked",event.target);
           return;
        }
        if(AppGlobal.vv().gameNetMgr.turn != AppGlobal.vv().gameNetMgr.seatIndex){
           console.log("not your turn." + AppGlobal.vv().gameNetMgr.turn);
           return;
        }

        
        for(var i = 0; i < this._myMJArr.length; ++i){
           if(event.target == this._myMJArr[i].node){
               if(event.target == this._selectedMJ){
                   this.shoot((this._selectedMJ as any).mjId); 
                   (this._selectedMJ as any).y = 0;
                   this._selectedMJ = null;
                   return;
               }
               if(this._selectedMJ != null){
                   (this._selectedMJ as any).y = 0;
               }
               const node = event.target as Node
               if(node) {
                console.log("--- node :" + node)
                AppGlobal.vv().utils.setLocation(node, {y: 15})
                this._selectedMJ = node;
               }
               
               return;
           }
        }
    }

    shoot (mjId: any) {
        if(mjId == null){
           return;
        }
        AppGlobal.vv().net.send('chupai',mjId);
    }

    getMJIndex (side: any, index: any) {
        if(side == "right" || side == "up"){
           return 13 - index;
        }
        return index;
    }

    initMopai (seatIndex: any, pai: any) {
        var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(seatIndex);
        var side = AppGlobal.vv().mahjongmgr.getSide(localIndex);
        var pre = AppGlobal.vv().mahjongmgr.getFoldPre(localIndex);
        var gameChild = this.node.getChildByName("game");
        var sideChild = gameChild.getChildByName(side);
        var holds = sideChild.getChildByName("holds");
        var lastIndex = this.getMJIndex(side,13);
        var nc = holds.children[lastIndex];
        AppGlobal.vv().utils.setScale(nc, {x: 1.0, y: 1.0})
        
        if(pai == null){
           nc.active = false;
        }
        else if(pai >= 0){
           nc.active = true;
           if(side == "up"){
            AppGlobal.vv().utils.setScale(nc, {x: 0.73, y: 0.73})
           }
           var sprite = nc.getComponent(Sprite); 
           sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID(pre,pai);
        }
        else if(pai != null){
           nc.active = true;
           if(side == "up"){
            AppGlobal.vv().utils.setScale(nc, {x: 1.0, y: 1.0})
           }
           var sprite = nc.getComponent(Sprite); 
           sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getHoldsEmptySpriteFrame(side);
        }
    }

    initEmptySprites (seatIndex: any) {
        var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(seatIndex);
        var side = AppGlobal.vv().mahjongmgr.getSide(localIndex);
        var pre = AppGlobal.vv().mahjongmgr.getFoldPre(localIndex);
        var gameChild = this.node.getChildByName("game");
        var sideChild = gameChild.getChildByName(side);
        var holds = sideChild.getChildByName("holds");
        var spriteFrame = AppGlobal.vv().mahjongmgr.getEmptySpriteFrame(side);
        for(var i = 0; i < holds.children.length; ++i){
           var nc = holds.children[i];
        //    AppGlobal.vv().utils.setScale(nc, {x: 1.0, y: 1.0})
           
           var sprite = nc.getComponent(Sprite); 
           sprite.spriteFrame = spriteFrame;
        }
    }

    initOtherMahjongs (seatData: any) {
        var localIndex = this.getLocalIndex(seatData.seatindex);
        if(localIndex == 0){
           return;
        }
        var side = AppGlobal.vv().mahjongmgr.getSide(localIndex);
        var game = this.node.getChildByName("game");
        var sideRoot = game.getChildByName(side);
        var sideHolds = sideRoot.getChildByName("holds");
        var num = seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.wangangs.length;
        num *= 3;
        for(var i = 0; i < num; ++i){
           var idx = this.getMJIndex(side,i);
           sideHolds.children[idx].active = false;
        }
        var pre = AppGlobal.vv().mahjongmgr.getFoldPre(localIndex);
        var holds = this.sortHolds(seatData);
        if(holds != null && holds.length > 0){
           for(var i = 0; i < holds.length; ++i){
               var idx = this.getMJIndex(side,i + num);
               var sprite = sideHolds.children[idx].getComponent(Sprite); 
               if(side == "up"){
                AppGlobal.vv().utils.setScale(sprite.node, {x: 0.73, y: 0.73})
               }
               sprite.node.active = true;
               sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID(pre,holds[i]);
           }
           if(holds.length + num == 13){
               var lasetIdx = this.getMJIndex(side,13);
               sideHolds.children[lasetIdx].active = false;
           }
        }
    }

    sortHolds (seatData: any) {
        var holds = seatData.holds;
        if(holds == null){
           return null;
        }
        var mopai = null;
        var l = holds.length 
        if( l == 2 || l == 5 || l == 8 || l == 11 || l == 14){
           mopai = holds.pop();
        }
        var dingque = seatData.dingque;
        AppGlobal.vv().mahjongmgr.sortMJ(holds,dingque);
        if(mopai != null){
           holds.push(mopai);
        }
        return holds;
    }

    initMahjongs () {
        var seats = AppGlobal.vv().gameNetMgr.seats;
        var seatData = seats[AppGlobal.vv().gameNetMgr.seatIndex];
        var holds = this.sortHolds(seatData);
        if(holds == null){
           return;
        }
        var lackingNum = (seatData.pengs.length + seatData.angangs.length + seatData.diangangs.length + seatData.wangangs.length)*3;
        for(var i = 0; i < holds.length; ++i){
           var mjid = holds[i];
           var sprite = this._myMJArr[i + lackingNum];
           (sprite.node as any).mjId = mjid;
           (sprite.node as any).y = 0;
           this.setSpriteFrameByMJID("M_",sprite,mjid);
        }
        for(var i = 0; i < lackingNum; ++i){
           var sprite = this._myMJArr[i]; 
           (sprite.node as any).mjId = null;
           sprite.spriteFrame = null;
           sprite.node.active = false;
        }
        for(var i: number = lackingNum + holds.length; i < this._myMJArr.length; ++i){
           var sprite = this._myMJArr[i]; 
           (sprite.node as any).mjId = null;
           sprite.spriteFrame = null;
           sprite.node.active = false;            
        }
    }

    setSpriteFrameByMJID (pre: any, sprite: any, mjid: number) {
        sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID(pre,mjid);
        sprite.node.active = true;
    }

    checkQueYiMen () {

        console.log("on game begin !!!!!!!!")
        if(AppGlobal.vv().gameNetMgr.conf==null || AppGlobal.vv().gameNetMgr.conf.type != "xlch" || !AppGlobal.vv().gameNetMgr.getSelfData().hued){
           var dingque = AppGlobal.vv().gameNetMgr.dingque;
           var hasQue = false;
           if(AppGlobal.vv().gameNetMgr.seatIndex == AppGlobal.vv().gameNetMgr.turn){
               for(var i = 0; i < this._myMJArr.length; ++i){
                   var sprite = this._myMJArr[i];
                   if((sprite.node as any).mjId != null){
                       var type = AppGlobal.vv().mahjongmgr.getMahjongType((sprite.node as any).mjId);
                       if(type == dingque){
                           hasQue = true;
                           break;
                       }
                   }
               }            
           }
           for(var i = 0; i < this._myMJArr.length; ++i){
               var sprite = this._myMJArr[i];
               if((sprite.node as any).mjId != null){
                   var type = AppGlobal.vv().mahjongmgr.getMahjongType((sprite.node as any).mjId);
                   if(hasQue && type != dingque){
                       sprite.node.getComponent(Button).interactable = false;
                   }
                   else{
                       sprite.node.getComponent(Button).interactable = true;
                   }
               }
           }   
        }
        else{
           if(AppGlobal.vv().gameNetMgr.seatIndex == AppGlobal.vv().gameNetMgr.turn){
               for(var i = 0; i < 14; ++i){
                   var sprite = this._myMJArr[i]; 
                   if(sprite.node.active == true){
                       sprite.node.getComponent(Button).interactable = i == 13;
                   }
               }
           }
           else{
               for(var i = 0; i < 14; ++i){
                   var sprite = this._myMJArr[i]; 
                   if(sprite.node.active == true){
                       sprite.node.getComponent(Button).interactable = true;
                   }
               }
           }
        }
    }

    getLocalIndex (index: any) {
        var ret = (index - AppGlobal.vv().gameNetMgr.seatIndex + 4) % 4;
        return ret;
    }

    onOptionClicked (event: any) {
        console.log(event.target.pai);
        if(event.target.name == "btnPeng"){
            AppGlobal.vv().net.send("peng");
        }
        else if(event.target.name == "btnGang"){
            AppGlobal.vv().net.send("gang",event.target.pai);
        }
        else if(event.target.name == "btnHu"){
            AppGlobal.vv().net.send("hu");
        }
        else if(event.target.name == "btnGuo"){
            AppGlobal.vv().net.send("guo");
        }
    }

    update (dt: any) {
    }

    onDestroy () {
        console.log("onDestroy");
        if(AppGlobal.vv()){
            AppGlobal.vv().gameNetMgr.clear();   
        }
    }

}