import { _decorator, Component, director, Label, Node, utils } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('GameResult')
export class GameResult extends Component {
    private _gameresult: Node = null
    private _seats = [];

    onLoad () {
        if(AppGlobal.vv() == null){
           return;
        }
        this._gameresult = this.node.getChildByName("game_result");
        var seats = this._gameresult.getChildByName("seats");
        for(var i = 0; i < seats.children.length; ++i){
           this._seats.push(seats.children[i].getComponent("Seat"));   
        }
        var btnClose = utils.find("game_result/btnClose", this.node);
        if(btnClose){
            AppGlobal.vv().utils.addClickEvent(btnClose,this.node,"GameResult","onBtnCloseClicked");
        }
        var btnShare = utils.find("game_result/btnShare", this.node);
        if(btnShare){
            AppGlobal.vv().utils.addClickEvent(btnShare,this.node,"GameResult","onBtnShareClicked");
        }
        var self = this;
        this.node.on('game_end',function(data){self.onGameEnd(data.detail);});
    }

    showResult (seat: any, info: any, isZuiJiaPaoShou: any) {
        seat.node.getChildByName("zuijiapaoshou").active = isZuiJiaPaoShou;
        seat.node.getChildByName("zimocishu").getComponent(Label).string = info.numzimo;
        seat.node.getChildByName("jiepaocishu").getComponent(Label).string = info.numjiepao;
        seat.node.getChildByName("dianpaocishu").getComponent(Label).string = info.numdianpao;
        seat.node.getChildByName("angangcishu").getComponent(Label).string = info.numangang;
        seat.node.getChildByName("minggangcishu").getComponent(Label).string = info.numminggang;
        seat.node.getChildByName("chajiaocishu").getComponent(Label).string = info.numchadajiao;
    }

    onGameEnd (endinfo: any) {
        var seats = AppGlobal.vv().gameNetMgr.seats;
        var maxscore = -1;
        var maxdianpao = 0;
        var dianpaogaoshou = -1;
        for(var i = 0; i < seats.length; ++i){
           var seat = seats[i];
           if(seat.score > maxscore){
               maxscore = seat.score;
           }
           if(endinfo[i].numdianpao > maxdianpao){
               maxdianpao = endinfo[i].numdianpao;
               dianpaogaoshou = i;
           }
        }
        for(var i = 0; i < seats.length; ++i){
           var seat = seats[i];
           var isBigwin = false;
           if(seat.score > 0){
               isBigwin = seat.score == maxscore;
           }
           this._seats[i].setInfo(seat.name,seat.score, isBigwin);
           this._seats[i].setID(seat.userid);
           var isZuiJiaPaoShou = dianpaogaoshou == i;
           this.showResult(this._seats[i],endinfo[i],isZuiJiaPaoShou);
        }
    }

    onBtnCloseClicked () {
        AppGlobal.vv().wc.show('正在返回游戏大厅');
        director.loadScene("hall");
    }

    onBtnShareClicked () {
        AppGlobal.vv().anysdkMgr.shareResult();
    }

}
