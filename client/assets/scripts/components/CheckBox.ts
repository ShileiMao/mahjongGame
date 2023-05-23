import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CheckBox')
export class CheckBox extends Component {
    @property
    public target:Node | null = null;
    @property
    public sprite:SpriteFrame | null = null;
    @property
    public checkedSprite:SpriteFrame | null = null;
    @property
    public checked = false;

    onLoad () {
        this.refresh();
    }

    onClicked () {
        this.checked = !this.checked;
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

}