import { _decorator, Component, utils, Node, Sprite, Label } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('UserInfoShow')
export class UserInfoShow extends Component {
    private _userinfo: Node;

    onLoad () {
        if(AppGlobal.vv() == null){
           return;
        }
        this._userinfo = utils.find("userinfo", this.node);
        this._userinfo.active = false;
        AppGlobal.vv().utils.addClickEvent(this._userinfo,this.node,"UserInfoShow","onClicked");
        AppGlobal.vv().userinfoShow = this;
    }

    show (name: any, userId: any, iconSprite: any, sex: any, ip: any) {
        if(userId != null && userId > 0){
           this._userinfo.active = true;
           this._userinfo.getChildByName("icon").getComponent(Sprite).spriteFrame = iconSprite.spriteFrame;
           this._userinfo.getChildByName("name").getComponent(Label).string = name;
           this._userinfo.getChildByName("ip").getComponent(Label).string = "IP: " + ip.replace("::ffff:","");
           this._userinfo.getChildByName("id").getComponent(Label).string = "ID: " + userId;
           var sex_female = this._userinfo.getChildByName("sex_female");
           sex_female.active = false;
           var sex_male = this._userinfo.getChildByName("sex_male");
           sex_male.active = false;
           if(sex == 1){
               sex_male.active = true;
           }   
           else if(sex == 2){
               sex_female.active = true;
           }
        }
    }

    onClicked () {
        this._userinfo.active = false;
    }

}

