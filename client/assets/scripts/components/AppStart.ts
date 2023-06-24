import { _decorator, Component, Label, sys, Canvas, assetManager, Prefab, VERSION, Sprite, director, resources, utils, UIOpacity } from 'cc';
import { HTTP } from '../HTTP';
import { Node } from 'cc';
import { AppGlobal } from './AppGlobal';

const { ccclass, property } = _decorator;

type Params = { [key: string]: string };

function urlParse(): Params {
    let params: Params = { };

    if(window.location == null){
        return params;
    }
    let name,value; 
    let str=window.location.href; //取得整个地址栏
    let num=str.indexOf("?") 
    str=str.substr(num+1); //取得所有参数   stringlet.substr(start [, length ]
    let arr=str.split("&"); //各个参数放到数组里
    for(let i=0;i < arr.length;i++){ 
        num=arr[i].indexOf("="); 
        if(num>0){ 
            name=arr[i].substring(0,num);
            value=arr[i].substr(num+1);
            params[name]=value;
        } 
    }
    return params;
}


function initMgr() {
    console.log("initMgr called, " + AppGlobal.vv().gameNetMgr);
    AppGlobal.vv().gameNetMgr.initHandlers(); // this is not work at here.. we need to call it from some where else
    AppGlobal.vv().anysdkMgr?.init();
    AppGlobal.vv().voiceMgr.init();
    AppGlobal.vv().audioMgr.init();
    const args = urlParse();
}

@ccclass('AppStart')
export class AppStart extends Component {
    @property
    public label: Label | null = null;
    @property
    public loadingProgess:Label | null = null;

    private _mainScene: string = '';
    private _splash?: Node | null = null;

    onLoad () {
        if(!sys.isNative && sys.isMobile) {
            var cvs = this.node.getComponent(Canvas);
            if(cvs) {
                cvs.alignCanvasWithScreen = true
            }
        }
        initMgr();
        console.log('application start, initMgr() called'); 
        this._mainScene = 'loading';
        this.showSplash(() =>{
            resources.load('resources/ver/cv', (err, data) => {
                // vv.VERSION = data
                console.warn("TODO: the data needs to be adjusted: " + data)
                console.log('current core version:' + data);
                this.getServerInfo(); 
            })  
        })
    }

    onBtnDownloadClicked () {
        // sys.openURL(vv.SI.)
        console.warn("TODO: adjust this part later")
        //cc.sys.openURL(cc.vv.SI.appweb);
    }

    showSplash (callback: any) {
        const self = this;
        const SHOW_TIME = 3000;
        const FADE_TIME = 500;
        this._splash = utils.find("splash", this.node);
        if(true || sys.os != sys.OS_IOS || !sys.isNative){
            this._splash.active = true;

           if(this._splash.getComponent(Sprite)?.spriteFrame == null){
               callback();
               return;
           }
           var justNow = Date.now();
           var fn = function(){
               var dt = Date.now() - justNow;
               if(dt < SHOW_TIME){
                   setTimeout(fn,33);
               }
               else {
                   var op = (1 - ((dt - SHOW_TIME) / FADE_TIME)) * 255;
                   if(op < 0){
                       self._splash.getComponent(UIOpacity).opacity = 0;
                       callback();   
                   }
                   else{
                    self._splash.getComponent(UIOpacity).opacity = op;
                       setTimeout(fn,33);   
                   }
               }
           };
           setTimeout(fn,33);
        }
        else{
           this._splash.active = false;
           callback();
        }
    }

    getServerInfo () {
        var self = this;

        var onGetVersion = (ret: any) => {
            if(ret.version == null){
                console.log("error.");
            }
            else{
                AppGlobal.vv().SI = ret;
                if(ret.version != AppGlobal.vv().VERSION) {
                    const node = utils.find("alert", self.node);
                    console.log("the node: " + node);
                    utils.find("alert", self.node).active = true
                } else {
                    director.loadScene(self._mainScene)
                }
            }
        };
        var xhr: XMLHttpRequest | null = null;
        var complete = false;
        var fnRequest = function(){
            self.loadingProgess.string = "正在连接服务器";
            
            xhr = new HTTP().sendRequest("/get_serverinfo", null, function(ret){
                console.log(" get server info response: " + JSON.stringify(ret))
                xhr = null;
                complete = true;
                onGetVersion(ret);
            }, null);
            setTimeout(fn,5000);            
        }
        var fn = function(){
            if(!complete){
                if(xhr){
                    xhr.abort();
                    self.loadingProgess.string = "连接失败，即将重试";
                    setTimeout(function(){
                        fnRequest();
                    },5000);
                }
                else{
                    fnRequest();
                }
            }
        };
        fn();
    }

    log (content: any) {
        this.label.string += content + '\n'; 
    }

}

