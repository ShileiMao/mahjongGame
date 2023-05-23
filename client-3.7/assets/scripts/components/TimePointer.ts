import { _decorator, Component, Label, Node } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('TimePointer')
export class TimePointer extends Component {
    private _arrow: Node = null
    private _pointer: Node = null
    private _timeLabel: Label = null
    private _time = -1;
    private _alertTime = -1;

    onLoad () {
        var gameChild = this.node.getChildByName("game");
        this._arrow = gameChild.getChildByName("arrow");
        this._pointer = this._arrow.getChildByName("pointer");
        this.initPointer();
        this._timeLabel = this._arrow.getChildByName("lblTime").getComponent(Label);
        this._timeLabel.string = "00";
        var self = this;
        this.node.on('game_begin',function(data){
           self.initPointer();
        });
        this.node.on('game_chupai',function(data){
           self.initPointer();
           self._time = 10;
           self._alertTime = 3;
        });
    }

    initPointer () {
        if(AppGlobal.vv() == null){
           return;
        }
        this._arrow.active = AppGlobal.vv().gameNetMgr.gamestate == "playing";
        if(!this._arrow.active){
           return;
        }
        var turn = AppGlobal.vv().gameNetMgr.turn;
        var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(turn);
        for(var i = 0; i < this._pointer.children.length; ++i){
           this._pointer.children[i].active = i == localIndex;
        }
    }

    update (dt: any) {
        if(this._time > 0){
           this._time -= dt;
           if(this._alertTime > 0 && this._time < this._alertTime){
            AppGlobal.vv().audioMgr.playSFX("timeup_alarm.mp3");
            this._alertTime = -1;
           }
           var pre = "";
           if(this._time < 0){
               this._time = 0;
           }
           var t = Math.ceil(this._time);
           if(t < 10){
               pre = "0";
           }
           this._timeLabel.string = pre + t; 
        }
    }
}