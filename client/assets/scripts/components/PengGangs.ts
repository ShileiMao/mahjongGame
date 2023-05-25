import { _decorator, Component, director, instantiate, Sprite, Vec3, view } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('PengGangs')
export class PengGangs extends Component {

    onLoad () {
        if(!AppGlobal.vv()){
           return;
        }
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName("myself");
        var pengangroot = myself.getChildByName("penggangs");

        // var realwidth = director.getVisibleSize().width;
        const realwidth = view.getVisibleSize().width;
        var scale = realwidth / 1280;
        const curScale = pengangroot.scale;
        pengangroot.setScale(new Vec3(curScale.x * scale, curScale.y * scale, curScale.z))
        var self = this;
        this.node.on('peng_notify',function(data){
           self.onPengGangChanged(data);
        });
        this.node.on('gang_notify',function(data){
           self.onPengGangChanged(data.seatData);
        });
        this.node.on('game_begin',function(data){
           self.onGameBein();
        });
        var seats = AppGlobal.vv().gameNetMgr.seats;
        for(var i in seats){
           this.onPengGangChanged(seats[i]);
        }
    }

    onGameBein () {
        this.hideSide("myself");
        this.hideSide("right");
        this.hideSide("up");
        this.hideSide("left");
    }

    hideSide (side: any) {
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName(side);
        var pengangroot = myself.getChildByName("penggangs");
        if(pengangroot){
           for(var i = 0; i < pengangroot.children.length; ++i){
               pengangroot.children[i].active = false;
           }            
        }
    }

    onPengGangChanged (seatData: any) {
        if(seatData.angangs == null && seatData.diangangs == null && seatData.wangangs == null && seatData.pengs == null){
           return;
        }
        var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(seatData.seatindex);
        var side = AppGlobal.vv().mahjongmgr.getSide(localIndex);
        var pre = AppGlobal.vv().mahjongmgr.getFoldPre(localIndex);
        console.log("onPengGangChanged" + localIndex);
        var gameChild = this.node.getChildByName("game");
        var myself = gameChild.getChildByName(side);
        var pengangroot = myself.getChildByName("penggangs");
        for(var i = 0; i < pengangroot.children.length; ++i){
           pengangroot.children[i].active = false;
        }
        var index = 0;
        var gangs = seatData.angangs
        for(var i = 0; i < gangs.length; ++i){
           var mjid = gangs[i];
           this.initPengAndGangs(pengangroot,side,pre,index,mjid,"angang");
           index++;    
        } 
        var gangs = seatData.diangangs
        for(var i = 0; i < gangs.length; ++i){
           var mjid = gangs[i];
           this.initPengAndGangs(pengangroot,side,pre,index,mjid,"diangang");
           index++;    
        }
        var gangs = seatData.wangangs
        for(var i = 0; i < gangs.length; ++i){
           var mjid = gangs[i];
           this.initPengAndGangs(pengangroot,side,pre,index,mjid,"wangang");
           index++;    
        }
        var pengs = seatData.pengs
        if(pengs){
           for(var i = 0; i < pengs.length; ++i){
               var mjid = pengs[i];
               this.initPengAndGangs(pengangroot,side,pre,index,mjid,"peng");
               index++;    
           }    
        }        
    }

    initPengAndGangs (pengangroot: any, side: any, pre: any, index: any, mjid: any, flag: any) {
        var pgroot = null;
        if(pengangroot.childrenCount <= index){
           if(side == "left" || side == "right"){
               pgroot = instantiate(AppGlobal.vv().mahjongmgr.pengPrefabLeft);
           }
           else{
               pgroot = instantiate(AppGlobal.vv().mahjongmgr.pengPrefabSelf);
           }
           pengangroot.addChild(pgroot);    
        }
        else{
           pgroot = pengangroot.children[index];
           pgroot.active = true;
        }
        if(side == "left"){
           pgroot.y = -(index * 25 * 3);                    
        }
        else if(side == "right"){
           pgroot.y = (index * 25 * 3);
           pgroot.setLocalZOrder(-index);
        }
        else if(side == "myself"){
           pgroot.x = index * 55 * 3 + index * 10;                    
        }
        else{
           pgroot.x = -(index * 55*3);
        }
        var sprites = pgroot.getComponentsInChildren(Sprite);
        for(var s = 0; s < sprites.length; ++s){
           var sprite = sprites[s];
           if(sprite.node.name == "gang"){
               var isGang = flag != "peng";
               sprite.node.active = isGang;
               sprite.node.scaleX = 1.0;
               sprite.node.scaleY = 1.0;
               if(flag == "angang"){
                   sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getEmptySpriteFrame(side);
                   if(side == "myself" || side == "up"){
                       sprite.node.scaleX = 1.4;
                       sprite.node.scaleY = 1.4;                        
                   }
               }   
               else{
                   sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID(pre,mjid);    
               }
           }
           else{ 
               sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID(pre,mjid);
           }
        }
    }

}