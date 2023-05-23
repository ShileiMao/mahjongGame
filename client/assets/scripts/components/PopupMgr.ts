import { _decorator, Component, Label, utils, Node, EventHandler, Button } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('PopupMgr')
export class PopupMgr extends Component {
    private _popuproot: Node = null
    private _settings: Node = null
    private _dissolveNotice: Node = null
    private _endTime = -1;
    private _extraInfo: string = null
    private _noticeLabel: Label = null

    onLoad () {
        if(AppGlobal.vv() == null){
           return;
        }
        AppGlobal.vv().popupMgr = this;
        this._popuproot = utils.find("popups", this.node);
        this._settings = utils.find("popups/settings", this.node);
        this._dissolveNotice = utils.find("popups/dissolve_notice", this.node);
        this._noticeLabel = this._dissolveNotice.getChildByName("info").getComponent(Label);
        this.closeAll();
        this.addBtnHandler("settings/btn_close");
        this.addBtnHandler("settings/btn_sqjsfj");
        this.addBtnHandler("dissolve_notice/btn_agree");
        this.addBtnHandler("dissolve_notice/btn_reject");
        this.addBtnHandler("dissolve_notice/btn_ok");
        var self = this;
        this.node.on("dissolve_notice",function(event){
           var data = event.detail;
           self.showDissolveNotice(data);
        });
        this.node.on("dissolve_cancel",function(event){
           self.closeAll();
        });
    }

    start () {
        if(AppGlobal.vv().gameNetMgr.dissoveData){
           this.showDissolveNotice(AppGlobal.vv().gameNetMgr.dissoveData);
        }
    }

    addBtnHandler (btnName: any) {
        var btn = utils.find("popups/" + btnName, this.node);
        this.addClickEvent(btn,this.node,"PopupMgr","onBtnClicked");
    }

    addClickEvent (node: any, target: any, component: any, handler: any) {
        var eventHandler = new EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        var clickEvents = node.getComponent(Button).clickEvents;
        clickEvents.push(eventHandler);
    }

    onBtnClicked (event: any) {
        this.closeAll();
        var btnName = event.target.name;
        if(btnName == "btn_agree"){
            AppGlobal.vv().net.send("dissolve_agree");
        }
        else if(btnName == "btn_reject"){
            AppGlobal.vv().net.send("dissolve_reject");
        }
        else if(btnName == "btn_sqjsfj"){
            AppGlobal.vv().net.send("dissolve_request"); 
        }
    }

    closeAll () {
        this._popuproot.active = false;
        this._settings.active = false;
        this._dissolveNotice.active = false;
    }

    showSettings () {
        this.closeAll();
        this._popuproot.active = true;
        this._settings.active = true;
    }

    showDissolveRequest () {
        this.closeAll();
        this._popuproot.active = true;
    }

    showDissolveNotice (data: any) {
        this._endTime = Date.now()/1000 + data.time;
        this._extraInfo = "";
        for(var i = 0; i < data.states.length; ++i){
           var b = data.states[i];
           var name = AppGlobal.vv().gameNetMgr.seats[i].name;
           if(b){
               this._extraInfo += "\n[已同意] "+ name;
           }
           else{
               this._extraInfo += "\n[待确认] "+ name;
           }
        }
        this.closeAll();
        this._popuproot.active = true;
        this._dissolveNotice.active = true;;
    }

    update (dt: any) {
        if(this._endTime > 0){
           var lastTime = this._endTime - Date.now() / 1000;
           if(lastTime < 0){
               this._endTime = -1;
           }
           var m = Math.floor(lastTime / 60);
           var s = Math.ceil(lastTime - m*60);
           var str = "";
           if(m > 0){
               str += m + "分"; 
           }
           this._noticeLabel.string = str + s + "秒后房间将自动解散" + this._extraInfo;
        }
    }

}
