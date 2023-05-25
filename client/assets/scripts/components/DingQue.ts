import { _decorator, Component, Label, Node, Animation, Button } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass, property } = _decorator;


// 本脚本挂在在 UI -> Canvas底下, 对应UI位于 Canvas -> game -> dingque
@ccclass('DingQue')
export class DingQue extends Component {
    @property(Node)
    public queYiMen: Node = null;
    @property
    public tips = [];
    @property
    public selected = [];
    @property
    public dingques = [];

    start () {
        this.initView();
        this.initDingQue();
        this.initEventHandlers();
    }

    initView () {
        var gameChild = this.node.getChildByName("game");
        this.queYiMen = gameChild.getChildByName("dingque");
        this.queYiMen.active = AppGlobal.vv().gameNetMgr.isDingQueing;
        var arr = ["myself","right","up","left"];
        for(var i = 0; i < arr.length; ++i){
           var side = gameChild.getChildByName(arr[i]);
           var seat = side.getChildByName("seat");
           var dingque = seat.getChildByName("que");
           this.dingques.push(dingque);
        }
        this.reset();
        var tips = this.queYiMen.getChildByName("tips");
        for(var i = 0; i < tips.children.length; ++i){
           var n = tips.children[i];
           this.tips.push(n.getComponent(Label));
        }
        if(AppGlobal.vv().gameNetMgr.gamestate == "dingque"){
           this.showDingQueChoice();
        }
    }

    initEventHandlers () {
        var self = this;
        this.node.on('game_dingque',function(data){
           self.showDingQueChoice();
        });
        this.node.on('game_dingque_notify',function(data){
           var seatIndex = AppGlobal.vv().gameNetMgr.getSeatIndexByID(data);
           var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(seatIndex);
           console.log("game_dingque_notify:" + localIndex);
           self.tips[localIndex].node.active = true;
        });
        this.node.on('game_dingque_finish',function(){
           self.queYiMen.active = false;
           AppGlobal.vv().gameNetMgr.isDingQueing = false;
           self.initDingQue();
        });
    }

    showDingQueChoice () {
        this.queYiMen.active = true;
        var sd = AppGlobal.vv().gameNetMgr.getSelfData();
        var typeCounts = [0,0,0];
        for(var i = 0; i < sd.holds.length; ++i){
           var pai = sd.holds[i];
           var type = AppGlobal.vv().mahjongmgr.getMahjongType(pai);
           typeCounts[type]++;
        }
        var min = 65535;
        var minIndex = 0;
        for(var i = 0; i < typeCounts.length; ++i){
           if(typeCounts[i] < min){
               min = typeCounts[i];
               minIndex = i;
           }
        }
        var arr = ["tong","tiao","wan"];
        for(var i = 0; i < arr.length; ++i){
           var node = this.queYiMen.getChildByName(arr[i]);
           if(minIndex == i){
               node.getComponent(Animation).play("dingque_tuijian");
           }
           else{
               node.getComponent(Animation).stop();
           }
        }
        this.reset();
        for(var i = 0; i < this.tips.length; ++i){
           var n = this.tips[i];
           if(i > 0){
               n.node.active = false;                
           }
           else{
               n.node.active = true;
           }
        }
    }

    initDingQue () {
        var arr = ["tong","tiao","wan"];
        var data = AppGlobal.vv().gameNetMgr.seats;
        for(var i = 0; i < data.length; ++i){
           var que = data[i].dingque;
           let questr: string = null
           if(que === null || que === undefined || que < 0 || que >= arr.length){
               que = null;
               questr = null;
           } else{
                questr = arr[que]
           }
           var localIndex = AppGlobal.vv().gameNetMgr.getLocalIndex(i);
           if(questr){
               this.dingques[localIndex].getChildByName(questr).active = true;    
           }
        }
    }

    reset () {
        this.setInteractable(true);
        this.selected.push(this.queYiMen.getChildByName("tong_selected"));
        this.selected.push(this.queYiMen.getChildByName("tiao_selected"));
        this.selected.push(this.queYiMen.getChildByName("wan_selected"));
        for(var i = 0; i < this.selected.length; ++i){
           this.selected[i].active = false;
        }        
        for(var i = 0; i < this.dingques.length; ++i){
           for(var j = 0; j < this.dingques[i].children.length; ++j){
               this.dingques[i].children[j].active = false;    
           }
        }
    }

    
    // 玩家选择缺一门回调 （在UI中给定)
    onQueYiMenClicked (event: any) {
        var type = 0;
        if(event.target.name == "tong"){
           type = 0;
        }
        else if(event.target.name == "tiao"){
           type = 1;
        }
        else if(event.target.name == "wan"){
           type = 2;
        }
        for(var i = 0; i < this.selected.length; ++i){
           this.selected[i].active = false;
        }  
        this.selected[type].active = true;
        
        AppGlobal.vv().gameNetMgr.dingque = type;
        AppGlobal.vv().net.send("dingque",type);
    }

    setInteractable (value: boolean) {
        this.queYiMen.getChildByName("tong").getComponent(Button).interactable = value;
        this.queYiMen.getChildByName("tiao").getComponent(Button).interactable = value;
        this.queYiMen.getChildByName("wan").getComponent(Button).interactable = value;        
    }

}
