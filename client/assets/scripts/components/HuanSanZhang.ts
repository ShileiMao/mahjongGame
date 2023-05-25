import { _decorator, Component, utils, Node, Label, Button, Sprite, math } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('HuanSanZhang')
export class HuanSanZhang extends Component {
    private _huanpaitip: Node = null
    private _huanpaiArr = [];

    onLoad () {
        this._huanpaitip = utils.find("huansanzhang", this.node);
        this._huanpaitip.active = AppGlobal.vv().gameNetMgr.isHuanSanZhang;
        if(this._huanpaitip.active){
           this.showHuanpai(AppGlobal.vv().gameNetMgr.getSelfData().huanpais == null);
        }
        this.initHuaipaiInfo();
        var btnOk = utils.find("huansanzhang/btn_ok", this.node);
        if(btnOk){
            AppGlobal.vv().utils.addClickEvent(btnOk,this.node,"HuanSanZhang","onHuanSanZhang");
        }
        var self = this;
        this.node.on('game_begin',function(data){
           self.initHuaipaiInfo();
        });
        this.node.on('game_huanpai',function(data){
          self._huanpaitip.active = true;
          self.showHuanpai(true);
        });
        this.node.on('huanpai_notify',function(data){
           if(data.seatindex == AppGlobal.vv().gameNetMgr.seatIndex){
               self.initHuaipaiInfo();   
           }
        });
        this.node.on('game_huanpai_over',function(data){
           self._huanpaitip.active = false;
           for(var i = 0; i < self._huanpaiArr.length; ++i){
               self._huanpaiArr[i].y = 0;
           }
           self._huanpaiArr = [];
           self.initHuaipaiInfo();
        });
        this.node.on('game_huanpai_result',function(data){
            AppGlobal.vv().gameNetMgr.isHuanSanZhang = false;
            self._huanpaitip.active = false;
            for(var i = 0; i < self._huanpaiArr.length; ++i){
                self._huanpaiArr[i].y = 0;
            }
           self._huanpaiArr = [];
        });
        this.node.on('mj_clicked',function(data){
           var target = data;
           var idx = self._huanpaiArr.indexOf(target); 
           if(idx != -1){
               target.y = 0;
               self._huanpaiArr.splice(idx,1);
           }
           else{
               if(self._huanpaiArr.length < 3){
                   self._huanpaiArr.push(target);
                   target.y = 15;
               }
           } 
        });
    }

    showHuanpai (interactable: boolean) {
        this._huanpaitip.getChildByName("info").getComponent(Label).string = interactable? "请选择三张一样花色的牌":"等待其他玩家选牌...";
        this._huanpaitip.getChildByName("btn_ok").getComponent(Button).interactable = interactable;
        this._huanpaitip.getChildByName("mask").active = false;        
    }

    initHuaipaiInfo () {
        var huaipaiinfo = utils.find("game/huanpaiinfo", this.node);
        var seat = AppGlobal.vv().gameNetMgr.getSelfData();
        if(seat.huanpais == null){
           huaipaiinfo.active = false;
           return;
        }
        huaipaiinfo.active = true;
        for(var i = 0; i < seat.huanpais.length; ++i){
           huaipaiinfo.getChildByName("hp" + (i + 1)).getComponent(Sprite).spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID("M_",seat.huanpais[i]);
        }
        var hpm = huaipaiinfo.getChildByName("hpm");
        hpm.active = true;
        if(AppGlobal.vv().gameNetMgr.huanpaimethod == 0){
            console.warn(" *********** this may not work!")
            hpm.setRotation(math.quat(0, 0, 90, 0))
        //    hpm.rotation = 90;
        }
        else if(AppGlobal.vv().gameNetMgr.huanpaimethod == 1){
            console.warn(" *********** this may not work!")
            hpm.setRotation(math.quat(0, 0, 0, 0))
        //    hpm.rotation = 0;
        }
        else if(AppGlobal.vv().gameNetMgr.huanpaimethod == 2){
        //    hpm.rotation = 180;
            console.warn(" *********** this may not work!")
            hpm.setRotation(math.quat(0, 0, 180, 0))
        }
        else{
           hpm.active = false;
        }
    }

    onHuanSanZhang (event: any) {
        if(this._huanpaiArr.length != 3){
           return;
        }
        var type = null;
        for(var i = 0; i < this._huanpaiArr.length; ++i){
           var pai = this._huanpaiArr[i].mjId;
           var nt = AppGlobal.vv().mahjongmgr.getMahjongType(pai); 
           if(type == null){
               type = nt;
           }
           else{
               if(type != nt){
                   return;
               }
           }
        }
        var data = {
           p1:this._huanpaiArr[0].mjId,
           p2:this._huanpaiArr[1].mjId,
           p3:this._huanpaiArr[2].mjId,
        }
        this._huanpaitip.getChildByName("info").getComponent(Label).string = "等待其他玩家选牌...";
        this._huanpaitip.getChildByName("btn_ok").getComponent(Button).interactable = false;
        this._huanpaitip.getChildByName("mask").active = true;
        AppGlobal.vv().net.send("huanpai",data);
    }

}
