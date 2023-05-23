import { _decorator, Component, Label, utils, Node, director, math } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass } = _decorator;

@ccclass('ReConnect')
export class ReConnect extends Component {
    private _reconnect: Node = null
    private _lblTip: Label = null
    private _loading_image : Node = null
    private _lastPing = 0;

    onLoad () {
        this._reconnect = utils.find("reconnect", this.node);
        this._loading_image = this._reconnect.getChildByName("loading_image");
        var self = this;
        var fnTestServerOn = function () {
            AppGlobal.vv().net.test(function (ret) {
               if (ret) {
                AppGlobal.vv().gameNetMgr.reset();
                   var roomId = AppGlobal.vv().userMgr.oldRoomId;
                   if (roomId != null) {
                    AppGlobal.vv().userMgr.oldRoomId = null;
                    AppGlobal.vv().userMgr.enterRoom(roomId, function (ret) {
                           if (ret.errcode != 0) {
                                AppGlobal.vv().gameNetMgr.roomId = null;
                                director.loadScene('hall');
                           }
                       });
                   }
               }
               else {
                   setTimeout(fnTestServerOn, 3000);
               }
           });
        }
        var fn = function (data) {
           self.node.off('disconnect', fn);
           self._reconnect.active = true;
           fnTestServerOn();
        };
        console.log("adasfdasdfsdf");
        this.node.on('login_finished', function () {
           self._reconnect.active = false;
           self.node.on('disconnect', fn);
        });
        this.node.on('disconnect', fn);
    }

    update (dt: any) {
        if (this._reconnect.active) {
            const rotation = this._loading_image.rotation;
            this._loading_image.setRotation(math.quat(0, 0, rotation.z - dt * 45, 0))
        //    this._loading_image.rotation = this._loading_image.rotation - dt * 45;
        }
    }

}