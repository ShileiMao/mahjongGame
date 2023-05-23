import { _decorator, Component, utils, Node, Label } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('Alert')
export class Alert extends Component {
    private _alert: Node;
    private _btnOK: Node;
    private _btnCancel: Node;
    private _title: Label;
    private _content: Label;
    private _onok: Function;

    onLoad () {
        this._alert = utils.find("alert", this.node);
        this._title = utils.find("alert/title", this.node).getComponent(Label);
        this._content = utils.find("alert/content", this.node).getComponent(Label);
        this._btnOK = utils.find("alert/btn_ok", this.node);
        this._btnCancel = utils.find("alert/btn_cancel", this.node);
        AppGlobal.vv().utils.addClickEvent(this._btnOK,this.node,"Alert","onBtnClicked");
        AppGlobal.vv().utils.addClickEvent(this._btnCancel,this.node,"Alert","onBtnClicked");
        this._alert.active = false;
        AppGlobal.vv().alert = this;
    }

    onBtnClicked (event: any) {
        if(event.target.name == "btn_ok"){
           if(this._onok) {
               this._onok();
           }
        }
        this._alert.active = false;
        this._onok = null;
    }

    show (title: any, content: string = null, onok: Function = null, needcancel: boolean = false) {
        this._alert.active = true;
        this._onok = onok;
        this._title.string = title;
        this._content.string = content;
        if(needcancel){
           this._btnCancel.active = true;
           const btnOkPos = this._btnOK.getPosition();
           const btnCancelPos = this._btnCancel.getPosition();
           this._btnOK.setPosition(0 - 150, btnOkPos.y);
           this._btnCancel.setPosition(150, btnCancelPos.y);
        }
        else{
           this._btnCancel.active = false;
           const btnOkPos = this._btnOK.getPosition();
           this._btnOK.setPosition(0, btnOkPos.y);
        }
    }

    onDestory () {
        AppGlobal.vv().alert = null
    }

}
