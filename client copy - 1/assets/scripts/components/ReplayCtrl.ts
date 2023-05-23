import { _decorator, Component, utils, Node, director } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('ReplayCtrl')
export class ReplayCtrl extends Component {
    private _nextPlayTime = 1;
    private _replay: Node = null
    private _isPlaying = true;

    onLoad () {
        if(AppGlobal.vv() == null){
           return;
        }
        this._replay = utils.find("replay", this.node);
        this._replay.active = AppGlobal.vv().replayMgr.isReplay();
    }

    onBtnPauseClicked () {
        this._isPlaying = false;
    }

    onBtnPlayClicked () {
        this._isPlaying = true;
    }

    onBtnBackClicked () {
        AppGlobal.vv().replayMgr.clear();
        AppGlobal.vv().gameNetMgr.reset();
        AppGlobal.vv().gameNetMgr.roomId = null;
        AppGlobal.vv().wc.show('正在返回游戏大厅');
        director.loadScene("hall");
    }

    update (dt: any) {
        if(AppGlobal.vv()){
           if(this._isPlaying && AppGlobal.vv().replayMgr.isReplay() == true && this._nextPlayTime > 0){
               this._nextPlayTime -= dt;
               if(this._nextPlayTime < 0){
                   this._nextPlayTime = AppGlobal.vv().replayMgr.takeAction();
               }
           }
        }
    }

}
