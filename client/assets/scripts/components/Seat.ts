import {
  _decorator,
  Button,
  Component,
  Label,
  Node,
  Sprite,
  Animation,
} from "cc";
import { AppGlobal } from "./AppGlobal";
import { ImageLoader } from "./ImageLoader";
const { ccclass } = _decorator;

@ccclass("Seat")
export class Seat extends Component {
  private _sprIcon: ImageLoader = null;
  private _zhuang: Node = null;
  private _ready: Node = null;
  private _offline: Node = null;
  private _lblName: Label = null;
  private _lblScore: Label = null;
  private _scoreBg: Node = null;
  private _nddayingjia: Node = null;
  private _voicemsg: Node = null;
  private _xuanpai: Node = null;
  private _chatBubble: Node = null;
  private _emoji: Node = null;
  private _lastChatTime = -1;
  private _userName = "";
  private _score = 0;
  private _dayingjia = false;
  private _isOffline = false;
  private _isReady = false;
  private _isZhuang = false;
  private _userId: number = null;

  onLoad() {
    if (AppGlobal.vv() == null) {
      return;
    }
    this._sprIcon = this.node.getChildByName("icon").getComponent(ImageLoader);
    this._lblName = this.node.getChildByName("name").getComponent(Label);
    this._lblScore = this.node.getChildByName("score").getComponent(Label);
    this._voicemsg = this.node.getChildByName("voicemsg");
    this._xuanpai = this.node.getChildByName("xuanpai");
    this.refreshXuanPaiState();
    if (this._voicemsg) {
      this._voicemsg.active = false;
    }
    if (this._sprIcon && this._sprIcon.getComponent(Button)) {
      console.log("adding click event for the icon ");
      AppGlobal.vv().utils.addClickEvent(
        this._sprIcon.node,
        this.node,
        "Seat",
        "onIconClicked"
      );
    }
    this._offline = this.node.getChildByName("offline");
    this._ready = this.node.getChildByName("ready");
    this._zhuang = this.node.getChildByName("zhuang");
    this._scoreBg = this.node.getChildByName("Z_money_frame");
    this._nddayingjia = this.node.getChildByName("dayingjia");
    this._chatBubble = this.node.getChildByName("ChatBubble");
    if (this._chatBubble != null) {
      this._chatBubble.active = false;
    }
    this._emoji = this.node.getChildByName("emoji");
    if (this._emoji != null) {
      this._emoji.active = false;
    }
    this.refresh();
    if (this._sprIcon && this._userId) {
      this._sprIcon.setUserID(this._userId);
    }
  }

  onIconClicked() {
    console.log("on icon clicked!!");
    var iconSprite = this._sprIcon.node.getComponent(Sprite);
    if (this._userId != null && this._userId > 0) {
      var seat = AppGlobal.vv().gameNetMgr.getSeatByID(this._userId);
      var sex = 0;
      if (AppGlobal.vv().baseInfoMap) {
        var info = AppGlobal.vv().baseInfoMap[this._userId];
        if (info) {
          sex = info.sex;
        }
      }
      AppGlobal.vv().userinfoShow.show(
        seat.name,
        seat.userid,
        iconSprite,
        sex,
        seat.ip
      );
    }
  }

  refresh() {
    if (this._lblName != null) {
      this._lblName.string = this._userName;
    }
    if (this._lblScore != null) {
      this._lblScore.string = this._score + "";
    }
    if (this._nddayingjia != null) {
      this._nddayingjia.active = this._dayingjia == true;
    }
    if (this._offline) {
      this._offline.active = this._isOffline && this._userName != "";
    }
    if (this._ready) {
      this._ready.active =
        this._isReady && AppGlobal.vv().gameNetMgr.numOfGames > 0;
    }
    if (this._zhuang) {
      this._zhuang.active = this._isZhuang;
    }
    this.node.active = this._userName != null && this._userName != "";
  }

  setInfo(name: string, score: number, dayingjia: boolean) {
    this._userName = name;
    this._score = score;
    if (this._score == null) {
      this._score = 0;
    }
    this._dayingjia = dayingjia;
    if (this._scoreBg != null) {
      this._scoreBg.active = this._score != null;
    }
    if (this._lblScore != null) {
      this._lblScore.node.active = this._score != null;
    }
    this.refresh();
  }

  setZhuang(value: boolean) {
    this._isZhuang = value;
    if (this._zhuang) {
      this._zhuang.active = value;
    }
  }

  setReady(isReady: boolean) {
    this._isReady = isReady;
    if (this._ready) {
      this._ready.active =
        this._isReady && AppGlobal.vv().gameNetMgr.numOfGames > 0;
    }
  }

  setID(id: number) {
    var idNode = this.node.getChildByName("id");
    if (idNode) {
      var lbl = idNode.getComponent(Label);
      lbl.string = "ID:" + id;
    }
    this._userId = id;
    if (this._sprIcon) {
      this._sprIcon.setUserID(id);
    }
  }

  setOffline(isOffline: boolean) {
    this._isOffline = isOffline;
    if (this._offline) {
      this._offline.active = this._isOffline && this._userName != "";
    }
  }

  chat(content: any) {
    if (this._chatBubble == null || this._emoji == null) {
      return;
    }
    this._emoji.active = false;
    this._chatBubble.active = true;
    this._chatBubble.getComponent(Label).string = content;
    this._chatBubble.getChildByName("New Label").getComponent(Label).string =
      content;
    this._lastChatTime = 3;
  }

  emoji(emoji: any) {
    if (this._emoji == null || this._emoji == null) {
      return;
    }
    console.log(emoji);
    this._chatBubble.active = false;
    this._emoji.active = true;
    this._emoji.getComponent(Animation).play(emoji);
    this._lastChatTime = 3;
  }

  voiceMsg(show: any) {
    if (this._voicemsg) {
      this._voicemsg.active = show;
    }
  }

  refreshXuanPaiState() {
    if (this._xuanpai == null) {
      return;
    }
    this._xuanpai.active = AppGlobal.vv().gameNetMgr.isHuanSanZhang;
    if (AppGlobal.vv().gameNetMgr.isHuanSanZhang == false) {
      return;
    }
    this._xuanpai.getChildByName("xz").active = false;
    this._xuanpai.getChildByName("xd").active = false;
    var seat = AppGlobal.vv().gameNetMgr.getSeatByID(this._userId);
    if (seat) {
      if (seat.huanpais == null) {
        this._xuanpai.getChildByName("xz").active = true;
      } else {
        this._xuanpai.getChildByName("xd").active = true;
      }
    }
  }

  update(dt: any) {
    if (this._lastChatTime > 0) {
      this._lastChatTime -= dt;
      if (this._lastChatTime < 0) {
        this._chatBubble.active = false;
        this._emoji.active = false;
        this._emoji.getComponent(Animation).stop();
      }
    }
  }
}
