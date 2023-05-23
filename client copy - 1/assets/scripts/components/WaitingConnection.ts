import { _decorator, Component, Node, Label, math } from 'cc';
import { AppGlobal } from './AppGlobal';
// import { AppGlobal } from './AppGlobal';
const { ccclass, property } = _decorator;

@ccclass('WaitingConnection')
export class WaitingConnection extends Component {
    @property
    public target:Node | null = null;
    private _isShow = false;
    @property
    public lblContent:Label | null = null;

    onLoad () {
        console.log("******* waiting connection start!*")
        AppGlobal.vv().wc = this;
        this.node.active = this._isShow;
    }

    update (dt: any) {
        let rotation = this.target.rotation;
        let rotationZ = rotation.w;

        // console.warn("这里的坐标可能有问题！！！！查看")
        this.target.setRotation(rotation.x, rotation.y, rotation.z, rotationZ - dt * 45);
    }

    show (content: any) {
        this._isShow = true;
        if(this.node){
           this.node.active = this._isShow;   
        }
        if(this.lblContent){
           if(content == null){
               content = "";
           }
           this.lblContent.string = content;
        }
    }

    hide () {
        this._isShow = false;
        if(this.node){
           this.node.active = this._isShow;   
        }
    }

}