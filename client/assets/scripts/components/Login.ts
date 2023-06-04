import { _decorator, Canvas, Component, director, sys, utils, Node } from 'cc';
import { AppGlobal } from './AppGlobal';
import { Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends Component {
    private _mima: string[];
    private _mimaIndex = 0;
    
    @property(Node)
    public btnQuickStart: Node

    onLoad () {
        if(!sys.isNative && sys.isMobile){
        //    var cvs = this.node.getComponent(Canvas);
        //    cvs.fitHeight = true;
        //    cvs.fitWidth = true;
        }
        console.log("loade******d")

        AppGlobal.vv().utils.addClickEvent(this.btnQuickStart, this.node, "Login", "onBtnQuickStartClicked")
        if(!AppGlobal.vv()){
           director.loadScene("loading");
           return;
        }
        AppGlobal.vv().http.url = AppGlobal.vv().http.master_url;
        AppGlobal.vv().net.addHandler('push_need_create_role',function(){
           console.log("onLoad:push_need_create_role");
           director.loadScene("createrole");
        });
        AppGlobal.vv().audioMgr.playBGM("bgMain.mp3");
        this._mima = ["A","A","B","B","A","B","A","B","A","A","A","B","B","B"];
        if(!sys.isNative || sys.os == sys.OS.WINDOWS){
           utils.find("btn_yk", this.node).active = true;
           utils.find("btn_weixin", this.node).active = false;
        }
        else{
           utils.find("btn_yk", this.node).active = false;
           utils.find("btn_weixin", this.node).active = true;
        }
    }

    start () {
        var account =  sys.localStorage.getItem("wx_account");
        var sign = sys.localStorage.getItem("wx_sign");
        if(account != null && sign != null){
           var ret = {
               errcode:0,
               account:account,
               sign:sign
           }
           AppGlobal.vv().userMgr.onAuth(ret);
        }   
    }

    onBtnQuickStartClicked () {
        console.log("******** quick start clicked *")
        AppGlobal.vv().userMgr.guestAuth();
    }

    onBtnWeichatClicked () {
        var self = this;
        AppGlobal.vv().anysdkMgr?.login();
    }

    onBtnMIMAClicked (event: any) {
        if(this._mima[this._mimaIndex] == event.target.name){
           this._mimaIndex++;
           if(this._mimaIndex == this._mima.length){
               utils.find("btn_yk", this.node).active = true;
           }
        }
        else{
           console.log("oh ho~~~");
           this._mimaIndex = 0;
        }
    }
}