import { _decorator, Component, Label } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass, property } = _decorator;

@ccclass('JoinGameInput')
export class JoinGameInput extends Component {
    @property([Label])
    public nums: [Label];

    private _inputIndex = 0;

    onLoad () {
    }

    onEnable () {
        this.onResetClicked();
    }

    onInputFinished (roomId: any) {
        AppGlobal.vv().userMgr.enterRoom(roomId,function(ret){
           if(ret.errcode == 0){
               this.node.active = false;
           }
           else{
               var content = "房间["+ roomId +"]不存在，请重新输入!";
               if(ret.errcode == 4){
                   content = "房间["+ roomId + "]已满!";
               }
               AppGlobal.vv().alert.show("提示",content);
               this.onResetClicked();
           }
        }.bind(this)); 
    }

    onInput (num: any) {
        if(this._inputIndex >= this.nums.length){
           return;
        }
        this.nums[this._inputIndex].string = num;
        this._inputIndex += 1;
        if(this._inputIndex == this.nums.length){
           var roomId = this.parseRoomID();
           console.log("ok:" + roomId);
           this.onInputFinished(roomId);
        }
    }

    onN0Clicked () {
        this.onInput(0);  
    }

    onN1Clicked () {
        this.onInput(1);  
    }

    onN2Clicked () {
        this.onInput(2);
    }

    onN3Clicked () {
        this.onInput(3);
    }

    onN4Clicked () {
        this.onInput(4);
    }

    onN5Clicked () {
        this.onInput(5);
    }

    onN6Clicked () {
        this.onInput(6);
    }

    onN7Clicked () {
        this.onInput(7);
    }

    onN8Clicked () {
        this.onInput(8);
    }

    onN9Clicked () {
        this.onInput(9);
    }

    onResetClicked () {
        for(var i = 0; i < this.nums.length; ++i){
           this.nums[i].string = "";
        }
        this._inputIndex = 0;
    }

    onDelClicked () {
        if(this._inputIndex > 0){
           this._inputIndex -= 1;
           this.nums[this._inputIndex].string = "";
        }
    }

    onCloseClicked () {
        this.node.active = false;
    }

    parseRoomID () {
        var str = "";
        for(var i = 0; i < this.nums.length; ++i){
           str += this.nums[i].string;
        }
        return str;
    }

}
