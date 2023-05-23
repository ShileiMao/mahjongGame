import { _decorator, assetManager, Canvas, Component, director, Label, loader, resources, sys, Texture2D } from 'cc';
const { ccclass, property } = _decorator;

// if (!loader.loadResAll) {
//    loader.loadResAll = cc.loader.loadResDir;
// }
@ccclass('LoadingLogic')
export class LoadingLogic extends Component {
    @property
    public tipLabel:Label | null = null;
    private _stateStr = '';
    private _progress = 0;
    private _splash = 'null';
    private _isLoading = false;

    onLoad () {
        console.log("loading logic on load called!")
        if(!sys.isNative && sys.isMobile){
           var cvs = this.node.getComponent(Canvas);
        //    cvs.fitHeight = true;
        //    cvs.fitWidth = true;
        }
        this.tipLabel.string = this._stateStr;
        this.startPreloading();
    }

    startPreloading () {
        this._stateStr = "正在加载资源，请稍候"
        this._isLoading = true;
        var self = this;
        
        loader.onProgress = function ( completedCount, totalCount,  item ){
           if(self._isLoading){
               self._progress = completedCount/totalCount;
           }
        };
        resources.load("textures", Texture2D, (err, assets) => {
            self.onLoadComplete();
        })
    }

    onLoadComplete () {
        console.log("load resource complete!!!")
        this._isLoading = false;
        this._stateStr = "准备登陆";
        director.loadScene("login");
        // cc.loader.onComplete = null;
    }

    update (dt: any) {
        if(this._stateStr.length == 0){
           return;
        }
        this.tipLabel.string = this._stateStr + ' ';
        if(this._isLoading){
           this.tipLabel.string += Math.floor(this._progress * 100) + "%";   
        }
        else{
           var t = Math.floor(Date.now() / 1000) % 4;
           for(var i = 0; i < t; ++ i){
               this.tipLabel.string += '.';
           }            
        }
    }

}