import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { AppGlobal } from './AppGlobal';
import { RadioGroupMgr } from './RadioGroupMgr';
const { ccclass, property } = _decorator;

@ccclass('RadioButton')
export class RadioButton extends Component {
    @property
    public target:Node | null = null;
    @property
    public sprite:SpriteFrame | null = null;
    @property
    public checkedSprite:SpriteFrame | null = null;
    @property
    public checked = false;
    @property
    public groupId = -1;

    onLoad () {
        if(AppGlobal.vv() == null){
           return;
        }
        if(AppGlobal.vv().radiogroupmgr == null){
           AppGlobal.vv().radiogroupmgr = new RadioGroupMgr();
           AppGlobal.vv().radiogroupmgr.init();
        }
        console.log(typeof(AppGlobal.vv().radiogroupmgr.add));
        AppGlobal.vv().radiogroupmgr.add(this);
        this.refresh();
    }

    refresh () {
        var targetSprite = this.target.getComponent(Sprite);
        if(this.checked){
           targetSprite.spriteFrame = this.checkedSprite;
        }
        else{
           targetSprite.spriteFrame = this.sprite;
        }
    }

    check (value: any) {
        this.checked = value;
        this.refresh();
    }

    onClicked () {
        AppGlobal.vv().radiogroupmgr.check(this);
    }

    onDestroy () {
        if(AppGlobal.vv() && AppGlobal.vv().radiogroupmgr){
            AppGlobal.vv().radiogroupmgr.del(this);            
        }
    }

}
