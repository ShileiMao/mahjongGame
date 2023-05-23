import { _decorator, Node, Color, Component, utils, Label, Sprite } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('Status')
export class Status extends Component {

    private red: Color = null
    private green: Color = null
    private yellow: Color = null
    start () {
        this.red = new Color(205,0,0);
        this.green = new Color(0,205,0);
        this.yellow = new Color(255,200,0);
    }

    update (dt: any) {
        var delay = this.node.getChildByName('delay');
        if(AppGlobal.vv().net.delayMS != null){
           delay.getComponent(Label).string = AppGlobal.vv().net.delayMS + 'ms';
           if(AppGlobal.vv().net.delayMS > 800){
            delay.getComponent(Label).color = this.red
           }
           else if(AppGlobal.vv().net.delayMS > 300){
               delay.getComponent(Label).color = this.yellow;
           }
           else{
               delay.getComponent(Label).color = this.green;
           }
        }
        else{
           delay.getComponent(Label).string = 'N/A';
           delay.getComponent(Label).color = this.red;
        }
        var power = this.node.getChildByName('power');
        AppGlobal.vv().utils.setScale(power, {x: AppGlobal.vv().anysdkMgr?.getBatteryPercent() || 100})
    }

}