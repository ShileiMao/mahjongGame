import { _decorator, Component, Sprite } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('Folds')
export class Folds extends Component {
    private _folds: any = null;

    onLoad () {
        this.initView();
        this.initEventHandler();
        this.initAllFolds();
    }

    initView () {
        this._folds = {};
        var game = this.node.getChildByName("game");
        var sides = ["myself","right","up","left"];
        for(var i = 0; i < sides.length; ++i){
           var sideName = sides[i];
           var sideRoot = game.getChildByName(sideName);
           var folds = [];
           var foldRoot = sideRoot.getChildByName("folds");
           for(var j = 0; j < foldRoot.children.length; ++j){
               var n = foldRoot.children[j];
               n.active = false;
               var sprite = n.getComponent(Sprite); 
               sprite.spriteFrame = null;
               folds.push(sprite);            
           }
           this._folds[sideName] = folds; 
        }
        this.hideAllFolds();
    }

    hideAllFolds () {
        for(var k in this._folds){
           var f = this._folds[i];
           for(var i in f){
               f[i].node.active = false;
           }
        }
    }

    initEventHandler () {
        var self = this;
        this.node.on('game_begin',function(data){
           self.initAllFolds();
        });  
        this.node.on('game_sync',function(data){
           self.initAllFolds();
        });
        this.node.on('game_chupai_notify',function(data){
           self.initFolds(data);
        });
        this.node.on('guo_notify',function(data){
           self.initFolds(data);
        });
    }

    initAllFolds () {
        var seats = AppGlobal.vv().gameNetMgr.seats;
        for(var i in seats){
           this.initFolds(seats[i]);
        }
    }

    initFolds (seatData: any) {
        var folds = seatData.folds;
        if(folds == null){
           return;
        }
        var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(seatData.seatindex);
        var pre = AppGlobal.vv().mahjongmgr.getFoldPre(localIndex);
        var side = AppGlobal.vv().mahjongmgr.getSide(localIndex);
        var foldsSprites = this._folds[side];
        for(var i = 0; i < foldsSprites.length; ++i){
           var index = i;
           if(side == "right" || side == "up"){
               index = foldsSprites.length - i - 1;
           }
           var sprite = foldsSprites[index];
           sprite.node.active = true;
           this.setSpriteFrameByMJID(pre,sprite,folds[i]);
        }
        for(var i:number = folds.length; i < foldsSprites.length; ++i){
           var index = i;
           if(side == "right" || side == "up"){
               index = foldsSprites.length - i - 1;
           }
           var sprite = foldsSprites[index];
           sprite.spriteFrame = null;
           sprite.node.active = false;
        }  
    }

    setSpriteFrameByMJID (pre: any, sprite: any, mjid: any) {
        sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID(pre,mjid);
        sprite.node.active = true;
    }

}
