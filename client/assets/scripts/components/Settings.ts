import { _decorator, Component, director, Node, Slider, sys } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('Settings')
export class Settings extends Component {
    private _btnYXOpen: Node = null
    private _btnYXClose: Node = null
    private _btnYYOpen: Node = null
    private _btnYYClose: Node = null

    onLoad () {
        if(AppGlobal.vv() == null){
           return;
        }
        this._btnYXOpen = this.node.getChildByName("yinxiao").getChildByName("btn_yx_open");
        this._btnYXClose = this.node.getChildByName("yinxiao").getChildByName("btn_yx_close");
        this._btnYYOpen = this.node.getChildByName("yinyue").getChildByName("btn_yy_open");
        this._btnYYClose = this.node.getChildByName("yinyue").getChildByName("btn_yy_close");
        this.initButtonHandler(this.node.getChildByName("btn_close"));
        this.initButtonHandler(this.node.getChildByName("btn_exit"));
        this.initButtonHandler(this._btnYXOpen);
        this.initButtonHandler(this._btnYXClose);
        this.initButtonHandler(this._btnYYOpen);
        this.initButtonHandler(this._btnYYClose);
        var slider = this.node.getChildByName("yinxiao").getChildByName("progress");
        AppGlobal.vv().utils.addSlideEvent(slider,this.node,"Settings","onSlided");
        var slider = this.node.getChildByName("yinyue").getChildByName("progress");
        AppGlobal.vv().utils.addSlideEvent(slider,this.node,"Settings","onSlided");
        this.refreshVolume();
    }

    onSlided (slider: Slider) {
        if(slider.node.parent.name == "yinxiao"){
            AppGlobal.vv().audioMgr.setSFXVolume(slider.progress);
        }
        else if(slider.node.parent.name == "yinyue"){
            AppGlobal.vv().audioMgr.setBGMVolume(slider.progress);
        }
        this.refreshVolume();
    }

    initButtonHandler (btn: any) {
        AppGlobal.vv().utils.addClickEvent(btn,this.node,"Settings","onBtnClicked");    
    }

    refreshVolume () {
        this._btnYXClose.active = AppGlobal.vv().audioMgr.sfxVolume > 0;
        this._btnYXOpen.active = !this._btnYXClose.active;
        var yx = this.node.getChildByName("yinxiao");
        var width = 430 * AppGlobal.vv().audioMgr.sfxVolume;
        var progress = yx.getChildByName("progress")
        progress.getComponent(Slider).progress = AppGlobal.vv().audioMgr.sfxVolume;
        AppGlobal.vv().utils.setSize(progress.getChildByName("progress"), {width: width})
        this._btnYYClose.active = AppGlobal.vv().audioMgr.bgmVolume > 0;
        this._btnYYOpen.active = !this._btnYYClose.active;
        var yy = this.node.getChildByName("yinyue");
        var width = 430 * AppGlobal.vv().audioMgr.bgmVolume;
        var progress = yy.getChildByName("progress");
        progress.getComponent(Slider).progress = AppGlobal.vv().audioMgr.bgmVolume; 
        AppGlobal.vv().utils.setSize(progress.getChildByName("progress"), {width: width})
    }

    onBtnClicked (event: any) {
        if(event.target.name == "btn_close"){
           this.node.active = false;
        }
        else if(event.target.name == "btn_exit"){
           sys.localStorage.removeItem("wx_account");
           sys.localStorage.removeItem("wx_sign");
           director.loadScene("login");
        }
        else if(event.target.name == "btn_yx_open"){
            AppGlobal.vv().audioMgr.setSFXVolume(1.0);
           this.refreshVolume(); 
        }
        else if(event.target.name == "btn_yx_close"){
            AppGlobal.vv().audioMgr.setSFXVolume(0);
           this.refreshVolume();
        }
        else if(event.target.name == "btn_yy_open"){
            AppGlobal.vv().audioMgr.setBGMVolume(1);
           this.refreshVolume();
        }
        else if(event.target.name == "btn_yy_close"){
            AppGlobal.vv().audioMgr.setBGMVolume(0);
           this.refreshVolume();
        }
    }

}