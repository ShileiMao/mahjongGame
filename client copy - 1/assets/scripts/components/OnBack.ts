import { _decorator, Component } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('OnBack')
export class OnBack extends Component {

    onLoad () {
        var btn = this.node.getChildByName("btn_back");
        AppGlobal.vv().utils.addClickEvent(btn,this.node,"OnBack","onBtnClicked");        
    }

    onBtnClicked (event: any) {
        if(event.target.name == "btn_back"){
           this.node.active = false;
        }
    }

}