import { _decorator, Component, utils, Node, Label } from 'cc';
const { ccclass } = _decorator;

@ccclass('NoticeTip')
export class NoticeTip extends Component {
    private _guohu: Node
    private _info: Label
    private _guohuTime = -1;

    onLoad () {
        this._guohu = utils.find("tip_notice", this.node);
        this._guohu.active = false;
        this._info = utils.find("tip_notice/info", this.node).getComponent(Label);
        var self = this;
        this.node.on('push_notice',function(data){
           var data = data.detail;
           self._guohu.active = true;
           self._guohuTime = data.time;
           self._info.string = data.info;
        });
    }

    update (dt: any) {
        if(this._guohuTime > 0){
          this._guohuTime -= dt;
          if(this._guohuTime < 0){
              this._guohu.active = false;
          }
        }
    }

}