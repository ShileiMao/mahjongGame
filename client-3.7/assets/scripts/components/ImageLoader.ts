import { _decorator, assetManager, Component, loader, resources, Sprite, SpriteFrame, sys, Texture2D } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

function loadImage(url: string,code, callback: Function){
    /*
    if(AppGlobal.vv().images == null){
        AppGlobal.vv().images = {};
    }
    let imageInfo = AppGlobal.vv().images[url];
    if(imageInfo == null){
        imageInfo = {
            image:null,
            queue:[],
        };
        AppGlobal.vv().images[url] = imageInfo;
    }
    
    resources.load<Texture2D>(url, (err, tex) => {
        imageInfo.image = tex;
        let spriteFrame = new SpriteFrame();
        spriteFrame.texture = tex

        // (tex, cc.Rect(0, 0, tex.width, tex.height));
        for(let i = 0; i < imageInfo.queue.length; ++i){
            let itm = imageInfo.queue[i];
            itm.callback(itm.code,spriteFrame);
        }
        // itm.queue = [];
    })

    if(imageInfo.image != null){
        let tex = imageInfo.image;
        let spriteFrame = new SpriteFrame;
        spriteFrame.texture = tex;
        //  (tex, cc.Rect(0, 0, tex.width, tex.height));
        callback(code,spriteFrame);
    }
    else{
        imageInfo.queue.push({code:code,callback:callback});
    }*/
    resources.load<Texture2D>(url, (err, tex) => {
        let spriteFrame = new SpriteFrame();
        spriteFrame.texture = tex;
        //(tex, cc.Rect(0, 0, tex.width, tex.height));
        callback(code,spriteFrame);
    })
};
function getBaseInfo(userid: number,callback: Function){
    if(AppGlobal.vv().baseInfoMap == null){
        AppGlobal.vv().baseInfoMap = {};
    }
    if(AppGlobal.vv().baseInfoMap[userid] != null){
        callback(userid, AppGlobal.vv().baseInfoMap[userid]);
    }
    else{
        AppGlobal.vv().http.sendRequest('/base_info',{userid:userid},function(ret){
            let url = null;
            if(ret.headimgurl){
               url = ret.headimgurl + ".jpg";
            }
            let info = {
                name:ret.name,
                sex:ret.sex,
                url:url,
            }
            AppGlobal.vv().baseInfoMap[userid] = info;
            callback(userid,info);
        },
        AppGlobal.vv().http.master_url);   
    }  
};

@ccclass('ImageLoader')
export class ImageLoader extends Component {
    private _spriteFrame: SpriteFrame

    onLoad () {
        this.setupSpriteFrame();
    }

    setUserID (userid: any) {
        if(sys.isNative == false){
           return;
        }
        if(!userid){
           return;
        }
        if(AppGlobal.vv().images == null){
           AppGlobal.vv().images = {};
        }
        var self = this;
        getBaseInfo(userid,function(code,info){
          if(info && info.url){
               loadImage(info.url,userid,function (err,spriteFrame) {
                   self._spriteFrame = spriteFrame;
                   self.setupSpriteFrame();
               });   
           } 
        });
    }

    setupSpriteFrame () {
        if(this._spriteFrame){
           var spr = this.getComponent(Sprite);
           if(spr){
               spr.spriteFrame = this._spriteFrame;    
           }
        }
    }

}

