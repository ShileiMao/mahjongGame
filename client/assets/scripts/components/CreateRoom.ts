import { _decorator, Component, Node } from 'cc';
import { RadioButton } from './RadioButton';
import { AppGlobal } from './AppGlobal';
import { CheckBox } from './CheckBox';
const { ccclass } = _decorator;

@ccclass('CreateRoom')
export class CreateRoom extends Component {
    private _leixingxuanze: RadioButton[];
    private _gamelist: Node
    private _currentGame: Node;
    private _lastType: string = '';
    onLoad () {
        this._gamelist = this.node.getChildByName('game_list');
        this._leixingxuanze = [];
        var t = this.node.getChildByName("leixingxuanze");
        for (var i = 0; i < t.children.length; ++i) {
           var n = t.children[i].getComponent(RadioButton);
           if (n != null) {
               this._leixingxuanze.push(n);
           }
        }
    }

    onBtnBack () {
        this.node.active = false;
    }

    onBtnOK () {
        var usedTypes = ['xzdd', 'xlch'];
        var type = this.getType();
        if (usedTypes.indexOf(type) == -1) {
           return;
        }
        this.node.active = false;
        this.createRoom();
    }

    getType(): string {
        var type = 0;
        for (var i = 0; i < this._leixingxuanze.length; ++i) {
           if (this._leixingxuanze[i].checked) {
               type = i;
               break;
           }
        }
        if (type == 0) {
           return 'xzdd';
        }
        else if (type == 1) {
           return 'xlch';
        }
        return 'xzdd';
    }

    getSelectedOfRadioGroup (groupRoot: any) {
        console.log(groupRoot);
        var t = this._currentGame.getChildByName(groupRoot);
        var arr = [];
        for (var i = 0; i < t.children.length; ++i) {
           var n = t.children[i].getComponent("RadioButton");
           if (n != null) {
               arr.push(n);
           }
        }
        var selected = 0;
        for (var i = 0; i < arr.length; ++i) {
           if (arr[i].checked) {
               selected = i;
               break;
           }
        }
        return selected;
    }

    createRoom () {
        var self = this;
        var onCreate = function (ret) {
           if (ret.errcode !== 0) {
               AppGlobal.vv().wc.hide();
               if (ret.errcode == 2222) {
                AppGlobal.vv().alert.show("提示", "钻石不足，创建房间失败!");
               }
               else {
                AppGlobal.vv().alert.show("提示", "创建房间失败,错误码:" + ret.errcode);
               }
           }
           else {
            console.log("*********** create room ")
            AppGlobal.vv().gameNetMgr.connectGameServer(ret);
           }
        };
        var type = this.getType();
        var conf = null;
        if (type == 'xzdd') {
           conf = this.constructSCMJConf();
        }
        else if (type == 'xlch') {
           conf = this.constructSCMJConf();
        }
        conf.type = type;
        var data = {
           account: AppGlobal.vv().userMgr.account,
           sign: AppGlobal.vv().userMgr.sign,
           conf: JSON.stringify(conf),
           salt: AppGlobal.vv().userMgr.salt
        };
        console.log(data);
        AppGlobal.vv().wc.show("正在创建房间");
        AppGlobal.vv().http.sendRequest("/create_private_room", data, onCreate);
    }

    constructSCMJConf () {
        var wanfaxuanze = this._currentGame.getChildByName('wanfaxuanze');
        var huansanzhang = wanfaxuanze.children[0].getComponent(CheckBox).checked;
        var jiangdui = wanfaxuanze.children[1].getComponent(CheckBox).checked;
        var menqing = wanfaxuanze.children[2].getComponent(CheckBox).checked;
        var tiandihu = wanfaxuanze.children[3].getComponent(CheckBox).checked;
        var difen = this.getSelectedOfRadioGroup('difenxuanze');
        var zimo = this.getSelectedOfRadioGroup('zimojiacheng');
        var zuidafanshu = this.getSelectedOfRadioGroup('zuidafanshu');
        var jushuxuanze = this.getSelectedOfRadioGroup('xuanzejushu');
        var dianganghua = this.getSelectedOfRadioGroup('dianganghua');
        var conf = {
           difen:difen,
           zimo:zimo,
           jiangdui:jiangdui,
           huansanzhang:huansanzhang,
           zuidafanshu:zuidafanshu,
           jushuxuanze:jushuxuanze,
           dianganghua:dianganghua,
           menqing:menqing,
           tiandihu:tiandihu,   
        };
        return conf;
    }

    update (dt: any) {
        var type = this.getType();
        if (this._lastType != type) {
           this._lastType = type;
           for (var i = 0; i < this._gamelist.children.length; ++i) {
               this._gamelist.children[i].active = false;
           }
           var game = this._gamelist.getChildByName(type);
           if (game) {
               game.active = true;
           }
           this._currentGame = game;
        }
    }

}
