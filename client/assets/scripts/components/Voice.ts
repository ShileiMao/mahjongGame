import { _decorator, Component, utils, Node, System, Input } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass, property } = _decorator;

@ccclass('Voice')
export class Voice extends Component {
    private _lastTouchTime: number = null
    private _voice: Node = null
    private _volume: Node = null
    private _voice_failed: Node = null
    private _lastCheckTime = -1;
    private _timeBar: Node = null
    @property
    public MAX_TIME = 15000;

    onLoad () {
        this._voice = utils.find("voice", this.node);
        this._voice.active = false;
        this._voice_failed = utils.find("voice/voice_failed", this.node);
        this._voice_failed.active = false;
        this._timeBar = utils.find("voice/time", this.node);
        AppGlobal.vv().utils.setScale(this._timeBar, {x: 0})
        this._volume = utils.find("voice/volume", this.node);
        for(var i = 1; i < this._volume.children.length; ++i){
           this._volume.children[i].active = false;
        }
        var btnVoice = utils.find("voice/voice_failed/btn_ok", this.node);
        if(btnVoice){
            AppGlobal.vv().utils.addClickEvent(btnVoice,this.node,"Voice","onBtnOKClicked");
        }
        var self = this;
        var btnVoice = utils.find("btn_voice", this.node);
        if(btnVoice){
           btnVoice.on(Input.EventType.TOUCH_START,function(){
               console.log("cc.Node.EventType.TOUCH_START");
               AppGlobal.vv().voiceMgr.prepare("record.amr");
               self._lastTouchTime = Date.now();
               self._voice.active = true;
               self._voice_failed.active = false;
           });
           btnVoice.on(Input.EventType.TOUCH_MOVE,function(){
               console.log("cc.Node.EventType.TOUCH_MOVE");
           });
           btnVoice.on(Input.EventType.TOUCH_END,function(){
               console.log("cc.Node.EventType.TOUCH_END");
               if(Date.now() - self._lastTouchTime < 1000){
                   self._voice_failed.active = true;
                   AppGlobal.vv().voiceMgr.cancel();
               }
               else{
                   self.onVoiceOK();
               }
               self._lastTouchTime = null;
           });
           btnVoice.on(Input.EventType.TOUCH_CANCEL,function(){
               console.log("cc.Node.EventType.TOUCH_CANCEL");
               AppGlobal.vv().voiceMgr.cancel();
               self._lastTouchTime = null;
               self._voice.active = false;
           });
        }
    }

    onVoiceOK () {
        if(this._lastTouchTime != null){
            AppGlobal.vv().voiceMgr.release();
           var time = Date.now() - this._lastTouchTime;
           var msg = AppGlobal.vv().voiceMgr.getVoiceData("record.amr");
           AppGlobal.vv().net.send("voice_msg",{msg:msg,time:time});
        }
        this._voice.active = false;
    }

    onBtnOKClicked () {
        this._voice.active = false;
    }

    update (dt: any) {
        if(this._voice.active == true && this._voice_failed.active == false){
           if(Date.now() - this._lastCheckTime > 300){
               for(var i = 0; i < this._volume.children.length; ++i){
                   this._volume.children[i].active = false;
               }
               var v = AppGlobal.vv().voiceMgr.getVoiceLevel(7);
               if(v >= 1 && v <= 7){
                   this._volume.children[v-1].active = true;   
               }
               this._lastCheckTime = Date.now();
           }
        }
        if(this._lastTouchTime){
           var time = Date.now() - this._lastTouchTime;
           if(time >= this.MAX_TIME){
               this.onVoiceOK();
               this._lastTouchTime = null;
           }
           else{
               var percent = time / this.MAX_TIME;
               AppGlobal.vv().utils.setScale(this._timeBar, {x: 1 - percent})
           }
        }
    }

}