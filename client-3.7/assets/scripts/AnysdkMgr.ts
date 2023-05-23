import { _decorator, Component, director, RenderTexture, sys, utils, Vec2 } from 'cc';
import { JSB } from 'cc/env';
import { AppGlobal } from './components/AppGlobal';
const { ccclass } = _decorator;

@ccclass('AnysdkMgr')
export class AnysdkMgr extends Component {
    private _isCapturing = false;
    private ANDROID_API: string
    private IOS_API: string

    onLoad () {
        console.log("on load AnysdkMgr");
    }

    init () {
        this.ANDROID_API = "com/babykylin/NativeAPI";
        this.IOS_API = "AppController";
    }

    getBatteryPercent () {
        if(sys.isNative){
           if(sys.os == sys.OS_ANDROID){
               return jsb.reflection.callStaticMethod(this.ANDROID_API, "getBatteryPercent", "()F");
           }
           else if(sys.os == sys.OS_IOS){
               return jsb.reflection.callStaticMethod(this.IOS_API, "getBatteryPercent", '');
           }            
        }
        return 0.9;
    }

    login () {
        if(sys.os == sys.OS_ANDROID){ 
           jsb.reflection.callStaticMethod(this.ANDROID_API, "Login", "()V");
        }
        else if(sys.os == sys.OS_IOS){
           jsb.reflection.callStaticMethod(this.IOS_API, "login", '');
        }
        else{
           console.log("platform:" + sys.os + " dosn't implement share.");
        }
    }

    share (title: any, desc: any) {
        if(sys.os == sys.OS_ANDROID){
           jsb.reflection.callStaticMethod(this.ANDROID_API, "Share", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", AppGlobal.vv().SI.appweb,title,desc);
        }
        else if(sys.os == sys.OS_IOS){
           jsb.reflection.callStaticMethod(this.IOS_API, "share:shareTitle:shareDesc:", AppGlobal.vv().SI.appweb,title,desc);
        }
        else{
           console.log("platform:" + sys.os + " dosn't implement share.");
        }
    }

    shareResult () {
        if(this._isCapturing){
           return;
        }
        this._isCapturing = true;
        var size = director.getWinSize();
        var currentDate = new Date();
        var fileName = "result_share.jpg";
        var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        if(jsb.fileUtils.isFileExist(fullPath)){
           jsb.fileUtils.removeFile(fullPath);
        }
        
        var texture = new RenderTexture();
        texture.resize(Math.floor(size.width), Math.floor(size.height));
        // texture.setPosition(new Vec2(size.width/2, size.height/2));
        // texture.begin();
        // cc.director.getRunningScene().visit();
        // texture.end();
        // texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);
        // var self = this;
        // var tryTimes = 0;
        // var fn = function(){
        //    if(jsb.fileUtils.isFileExist(fullPath)){
        //        var height = 100;
        //        var scale = height/size.height;
        // ar width = Math.floor(size.width * scale);
        //        if(cc.sys.os == cc.sys.OS_ANDROID){
        //            jsb.reflection.callStaticMethod(self.ANDROID_API, "ShareIMG", "(Ljava/lang/String;II)V",fullPath,width,height);
        //        }
        //        else if(cc.sys.os == cc.sys.OS_IOS){
        //            jsb.reflection.callStaticMethod(self.IOS_API, "shareIMG:width:height:",fullPath,width,height);
        //        }
        //        else{
        //            console.log("platform:" + cc.sys.os + " dosn't implement share.");
        //        }
        //        self._isCapturing = false;
        //    }
        //    else{
        //        tryTimes++;
        //        if(tryTimes > 10){
        //            console.log("time out...");
        //            return;
        //        }
        //        setTimeout(fn,50); 
        //    }
        // }
        // setTimeout(fn,50);
    }

    onLoginResp (code: any) {
        //var fn = function(ret){
        //    if(ret.errcode == 0){
        //        cc.sys.localStorage.setItem("wx_account",ret.account);
        //        cc.sys.localStorage.setItem("wx_sign",ret.sign);
        //    }
        //    cc.vv.userMgr.onAuth(ret);
        //}
        //cc.vv.http.sendRequest("/wechat_auth",{code:code,os:cc.sys.os},fn);
    }

}


/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
// cc.Class({
//     extends: cc.Component,
// 
//     properties: {
//         // foo: {
//         //    default: null,      // The default value will be used only when the component attaching
//         //                           to a node for the first time
//         //    url: cc.Texture2D,  // optional, default is typeof default
//         //    serializable: true, // optional, default is true
//         //    visible: true,      // optional, default is true
//         //    displayName: 'Foo', // optional
//         //    readonly: false,    // optional, default is false
//         // },
//         // ...
//         _isCapturing:false,
//     },
// 
//     // use this for initialization
//     onLoad: function () {
//     },
// 
//     // called every frame, uncomment this function to activate update callback
//     // update: function (dt) {
// 
//     // },
//     
//     init:function(){
//         this.ANDROID_API = "com/babykylin/NativeAPI";
//         this.IOS_API = "AppController";
//     },
// 
//     getBatteryPercent:function(){
//         if(cc.sys.isNative){
//             if(cc.sys.os == cc.sys.OS_ANDROID){
//                 return jsb.reflection.callStaticMethod(this.ANDROID_API, "getBatteryPercent", "()F");
//             }
//             else if(cc.sys.os == cc.sys.OS_IOS){
//                 return jsb.reflection.callStaticMethod(this.IOS_API, "getBatteryPercent");
//             }            
//         }
//         return 0.9;
//     },
//     
//     login:function(){
//         if(cc.sys.os == cc.sys.OS_ANDROID){ 
//             jsb.reflection.callStaticMethod(this.ANDROID_API, "Login", "()V");
//         }
//         else if(cc.sys.os == cc.sys.OS_IOS){
//             jsb.reflection.callStaticMethod(this.IOS_API, "login");
//         }
//         else{
//             console.log("platform:" + cc.sys.os + " dosn't implement share.");
//         }
//     },
//     
//     share:function(title,desc){
//         if(cc.sys.os == cc.sys.OS_ANDROID){
//             jsb.reflection.callStaticMethod(this.ANDROID_API, "Share", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",cc.vv.SI.appweb,title,desc);
//         }
//         else if(cc.sys.os == cc.sys.OS_IOS){
//             jsb.reflection.callStaticMethod(this.IOS_API, "share:shareTitle:shareDesc:",cc.vv.SI.appweb,title,desc);
//         }
//         else{
//             console.log("platform:" + cc.sys.os + " dosn't implement share.");
//         }
//     },
//     
//     shareResult:function(){
//         if(this._isCapturing){
//             return;
//         }
//         this._isCapturing = true;
//         var size = cc.director.getWinSize();
//         var currentDate = new Date();
//         var fileName = "result_share.jpg";
//         var fullPath = jsb.fileUtils.getWritablePath() + fileName;
//         if(jsb.fileUtils.isFileExist(fullPath)){
//             jsb.fileUtils.removeFile(fullPath);
//         }
//         var texture = new cc.RenderTexture(Math.floor(size.width), Math.floor(size.height));
//         texture.setPosition(cc.p(size.width/2, size.height/2));
//         texture.begin();
//         cc.director.getRunningScene().visit();
//         texture.end();
//         texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);
//         
//         var self = this;
//         var tryTimes = 0;
//         var fn = function(){
//             if(jsb.fileUtils.isFileExist(fullPath)){
//                 var height = 100;
//                 var scale = height/size.height;
// 			    var width = Math.floor(size.width * scale);
//                 
//                 if(cc.sys.os == cc.sys.OS_ANDROID){
//                     jsb.reflection.callStaticMethod(self.ANDROID_API, "ShareIMG", "(Ljava/lang/String;II)V",fullPath,width,height);
//                 }
//                 else if(cc.sys.os == cc.sys.OS_IOS){
//                     jsb.reflection.callStaticMethod(self.IOS_API, "shareIMG:width:height:",fullPath,width,height);
//                 }
//                 else{
//                     console.log("platform:" + cc.sys.os + " dosn't implement share.");
//                 }
//                 self._isCapturing = false;
//             }
//             else{
//                 tryTimes++;
//                 if(tryTimes > 10){
//                     console.log("time out...");
//                     return;
//                 }
//                 setTimeout(fn,50); 
//             }
//         }
//         setTimeout(fn,50);
//     },
//     
//     onLoginResp:function(code){
//         var fn = function(ret){
//             if(ret.errcode == 0){
//                 cc.sys.localStorage.setItem("wx_account",ret.account);
//                 cc.sys.localStorage.setItem("wx_sign",ret.sign);
//             }
//             cc.vv.userMgr.onAuth(ret);
//         }
//         cc.vv.http.sendRequest("/wechat_auth",{code:code,os:cc.sys.os},fn);
//     },
// });
