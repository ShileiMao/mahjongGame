import { _decorator, Component } from 'cc';
import { AppGlobal } from './components/AppGlobal';
const { ccclass } = _decorator;

let ACTION_CHUPAI = 1;
let ACTION_MOPAI = 2;
let ACTION_PENG = 3;
let ACTION_GANG = 4;
let ACTION_HU = 5;


type Action = {
    si: number;
    type: number;
    pai: number;
}

@ccclass('ReplayMgr')
export class ReplayMgr extends Component {
    private _lastAction: Action = null
    private _actionRecords: number[];
    private _currentIndex = 0;

    onLoad () {
    }

    clear () {
        this._lastAction = null;
        this._actionRecords = null;
        this._currentIndex = 0;
    }

    init (data: any) {
        this._actionRecords = data.action_records;
        if(this._actionRecords == null){
           this._actionRecords = [];
        }
        this._currentIndex = 0;
        this._lastAction = null;
    }

    isReplay () {
        return this._actionRecords != null;    
    }

    getNextAction () {
        if(this._currentIndex >= this._actionRecords.length){
           return null;
        }
        var si = this._actionRecords[this._currentIndex++];
        var action = this._actionRecords[this._currentIndex++];
        var pai = this._actionRecords[this._currentIndex++];
        return {si:si,type:action,pai:pai};
    }

    takeAction () {
        var action = this.getNextAction();
        if(this._lastAction != null && this._lastAction.type == ACTION_CHUPAI){
           if(action != null && action.type != ACTION_PENG && action.type != ACTION_GANG && action.type != ACTION_HU){
               AppGlobal.vv().gameNetMgr.doGuo(this._lastAction.si,this._lastAction.pai);
           }
        }
        this._lastAction = action;
        if(action == null){
           return -1;
        }
        var nextActionDelay = 1.0;
        if(action.type == ACTION_CHUPAI){
            AppGlobal.vv().gameNetMgr.doChupai(action.si,action.pai);
           return 1.0;
        }
        else if(action.type == ACTION_MOPAI){
            AppGlobal.vv().gameNetMgr.doMopai(action.si,action.pai);
            AppGlobal.vv().gameNetMgr.doTurnChange(action.si);
           return 0.5;
        }
        else if(action.type == ACTION_PENG){
            AppGlobal.vv().gameNetMgr.doPeng(action.si,action.pai);
            AppGlobal.vv().gameNetMgr.doTurnChange(action.si);
           return 1.0;
        }
        else if(action.type == ACTION_GANG){
            AppGlobal.vv().gameNetMgr.dispatchEvent('hangang_notify',action.si);
            AppGlobal.vv().gameNetMgr.doGang(action.si, action.pai + "");
            AppGlobal.vv().gameNetMgr.doTurnChange(action.si);
           return 1.0;
        }
        else if(action.type == ACTION_HU){
           AppGlobal.vv().gameNetMgr.doHu({seatindex:action.si,hupai:action.pai,iszimo:false});
           return 1.5;
        }
    }

}
