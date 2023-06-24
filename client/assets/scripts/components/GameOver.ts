import { _decorator, Component, instantiate, Label, Node, Sprite } from "cc";
import { AppGlobal } from "./AppGlobal";
const { ccclass } = _decorator;

@ccclass("GameOver")
export class GameOver extends Component {
  private _gameover: Node;
  private _gameresult: Node;
  private _seats = [];
  private _isGameEnd = false;
  private _pingju: Node;
  private _win: Node;
  private _lose: Node;

  onLoad() {
    if (AppGlobal.vv() == null) {
      return;
    }
    if (AppGlobal.vv().gameNetMgr.conf == null) {
      return;
    }

    if (AppGlobal.vv().gameNetMgr.conf.type == "xzdd") {
      this._gameover = this.node.getChildByName("game_over");
    } else {
      this._gameover = this.node.getChildByName("game_over_xlch");
    }
    this._gameover.active = false;
    this._pingju = this._gameover.getChildByName("pingju");
    this._win = this._gameover.getChildByName("win");
    this._lose = this._gameover.getChildByName("lose");
    this._gameresult = this.node.getChildByName("game_result");
    var wanfa = this._gameover.getChildByName("wanfa").getComponent(Label);
    wanfa.string = AppGlobal.vv().gameNetMgr.getWanfa();
    var listRoot = this._gameover.getChildByName("result_list");
    for (var i = 1; i <= 4; ++i) {
      var s = "s" + i;
      var sn = listRoot.getChildByName(s);
      var viewdata: any = {};
      viewdata.username = sn.getChildByName("username").getComponent(Label);
      viewdata.reason = sn.getChildByName("reason").getComponent(Label);
      var f = sn.getChildByName("fan");
      if (f != null) {
        viewdata.fan = f.getComponent(Label);
      }
      viewdata.score = sn.getChildByName("score").getComponent(Label);
      viewdata.hu = sn.getChildByName("hu");
      viewdata.mahjongs = sn.getChildByName("pai");
      viewdata.zhuang = sn.getChildByName("zhuang");
      viewdata.hupai = sn.getChildByName("hupai");
      viewdata._pengandgang = [];
      this._seats.push(viewdata);
    }
    var self = this;
    this.node.on("game_over", function (data) {
      self.onGameOver(data);
    });
    this.node.on("game_end", function (data) {
      self._isGameEnd = true;
    });
  }

  onGameOver(data: any) {
    if (AppGlobal.vv().gameNetMgr.conf.type == "xzdd") {
      this.onGameOver_XZDD(data);
    } else {
      this.onGameOver_XLCH(data);
    }
  }

  onGameOver_XZDD(data: any) {
    console.log(data);
    if (data.length == 0) {
      this._gameresult.active = true;
      return;
    }
    this._gameover.active = true;
    this._pingju.active = false;
    this._win.active = false;
    this._lose.active = false;
    var myscore = data[AppGlobal.vv().gameNetMgr.seatIndex].score;
    if (myscore > 0) {
      this._win.active = true;
    } else if (myscore < 0) {
      this._lose.active = true;
    } else {
      this._pingju.active = true;
    }
    for (var i = 0; i < 4; ++i) {
      var seatView = this._seats[i];
      var userData = data[i];
      var hued = false;
      var numOfGangs =
        userData.angangs.length +
        userData.wangangs.length +
        userData.diangangs.length;
      var numOfGen = userData.numofgen;
      var actionArr = [];
      var is7pairs = false;
      var ischadajiao = false;
      for (var j = 0; j < userData.actions.length; ++j) {
        var ac = userData.actions[j];
        if (
          ac.type == "zimo" ||
          ac.type == "ganghua" ||
          ac.type == "dianganghua" ||
          ac.type == "hu" ||
          ac.type == "gangpaohu" ||
          ac.type == "qiangganghu" ||
          ac.type == "chadajiao"
        ) {
          if (userData.pattern == "7pairs") {
            actionArr.push("七对");
          } else if (userData.pattern == "l7pairs") {
            actionArr.push("龙七对");
          } else if (userData.pattern == "j7pairs") {
            actionArr.push("将七对");
          } else if (userData.pattern == "duidui") {
            actionArr.push("碰碰胡");
          } else if (userData.pattern == "jiangdui") {
            actionArr.push("将对");
          }
          if (ac.type == "zimo") {
            actionArr.push("自摸");
          } else if (ac.type == "ganghua") {
            actionArr.push("杠上花");
          } else if (ac.type == "dianganghua") {
            actionArr.push("点杠花");
          } else if (ac.type == "gangpaohu") {
            actionArr.push("杠炮胡");
          } else if (ac.type == "qiangganghu") {
            actionArr.push("抢杠胡");
          } else if (ac.type == "chadajiao") {
            ischadajiao = true;
          }
          hued = true;
        } else if (ac.type == "fangpao") {
          actionArr.push("放炮");
        } else if (ac.type == "angang") {
          actionArr.push("暗杠");
        } else if (ac.type == "diangang") {
          actionArr.push("明杠");
        } else if (ac.type == "wangang") {
          actionArr.push("弯杠");
        } else if (ac.type == "fanggang") {
          actionArr.push("放杠");
        } else if (ac.type == "zhuanshougang") {
          actionArr.push("转手杠");
        } else if (ac.type == "beiqianggang") {
          actionArr.push("被抢杠");
        } else if (ac.type == "beichadajiao") {
          actionArr.push("被查叫");
        }
      }
      if (hued) {
        if (userData.qingyise) {
          actionArr.push("清一色");
        }
        if (userData.menqing) {
          actionArr.push("门清");
        }
        if (userData.zhongzhang) {
          actionArr.push("中张");
        }
        if (userData.jingouhu) {
          actionArr.push("金钩胡");
        }
        if (userData.haidihu) {
          actionArr.push("海底胡");
        }
        if (userData.tianhu) {
          actionArr.push("天胡");
        }
        if (userData.dihu) {
          actionArr.push("地胡");
        }
        if (numOfGen > 0) {
          actionArr.push("根x" + numOfGen);
        }
        if (ischadajiao) {
          actionArr.push("查大叫");
        }
      }
      for (var o = 0; o < 3; ++o) {
        seatView.hu.children[o].active = false;
      }
      if (userData.huorder >= 0) {
        seatView.hu.children[userData.huorder].active = true;
      }
      seatView.username.string = AppGlobal.vv().gameNetMgr.seats[i].name;
      seatView.zhuang.active = AppGlobal.vv().gameNetMgr.button == i;
      seatView.reason.string = actionArr.join("、");
      var fan = 0;
      if (hued) {
        fan = userData.fan;
      }
      seatView.fan.string = fan + "番";
      if (userData.score > 0) {
        seatView.score.string = "+" + userData.score;
      } else {
        seatView.score.string = userData.score;
      }
      var hupai = -1;
      if (hued) {
        hupai = userData.holds.pop();
      }
      AppGlobal.vv().mahjongmgr.sortMJ(userData.holds, userData.dingque);
      if (hued) {
        userData.holds.push(hupai);
      }
      for (var k = 0; k < seatView.mahjongs.child.length; ++k) {
        var n = seatView.mahjongs.children[k];
        n.active = false;
      }
      var lackingNum = (userData.pengs.length + numOfGangs) * 3;
      for (var k = 0; k < userData.holds.length; ++k) {
        var pai = userData.holds[k];
        var n = seatView.mahjongs.children[k + lackingNum];
        n.active = true;
        var sprite = n.getComponent(Sprite);
        sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID(
          "M_",
          pai
        );
      }
      for (var k = 0; k < seatView._pengandgang.length; ++k) {
        seatView._pengandgang[k].active = false;
      }
      var index = 0;
      var gangs = userData.angangs;
      for (var k = 0; k < gangs.length; ++k) {
        var mjid = gangs[k];
        this.initPengAndGangs(seatView, index, mjid, "angang");
        index++;
      }
      var gangs = userData.diangangs;
      for (var k = 0; k < gangs.length; ++k) {
        var mjid = gangs[k];
        this.initPengAndGangs(seatView, index, mjid, "diangang");
        index++;
      }
      var gangs = userData.wangangs;
      for (var k = 0; k < gangs.length; ++k) {
        var mjid = gangs[k];
        this.initPengAndGangs(seatView, index, mjid, "wangang");
        index++;
      }
      var pengs = userData.pengs;
      if (pengs) {
        for (var k = 0; k < pengs.length; ++k) {
          var mjid = pengs[k];
          this.initPengAndGangs(seatView, index, mjid, "peng");
          index++;
        }
      }
    }
  }

  onGameOver_XLCH(data: any) {
    console.log(data);
    if (data.length == 0) {
      this._gameresult.active = true;
      return;
    }
    this._gameover.active = true;
    this._pingju.active = false;
    this._win.active = false;
    this._lose.active = false;
    var myscore = data[AppGlobal.vv().gameNetMgr.seatIndex].score;
    if (myscore > 0) {
      this._win.active = true;
    } else if (myscore < 0) {
      this._lose.active = true;
    } else {
      this._pingju.active = true;
    }
    for (var i = 0; i < 4; ++i) {
      var seatView = this._seats[i];
      var userData = data[i];
      var hued = false;
      var actionArr = [];
      var is7pairs = false;
      var ischadajiao = false;
      var hupaiRoot = seatView.hupai;
      for (var j = 0; j < hupaiRoot.children.length; ++j) {
        hupaiRoot.children[j].active = false;
      }
      var hi = 0;
      for (var j = 0; j < userData.huinfo.length; ++j) {
        var info = userData.huinfo[j];
        hued = hued || info.ishupai;
        if (info.ishupai) {
          if (hi < hupaiRoot.children.length) {
            var hupaiView = hupaiRoot.children[hi];
            hupaiView.active = true;
            hupaiView.getComponent(Sprite).spriteFrame =
              AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID("B_", info.pai);
            hi++;
          }
        }
        var str = "";
        var sep = "";
        var dataseat = userData;
        if (!info.ishupai) {
          if (info.action == "fangpao") {
            str = "放炮";
          } else if (info.action == "gangpao") {
            str = "杠上炮";
          } else if (info.action == "beiqianggang") {
            str = "被抢杠";
          } else {
            str = "被查大叫";
          }
          dataseat = data[info.target];
          info = dataseat.huinfo[info.index];
        } else {
          if (info.action == "hu") {
            str = "接炮胡";
          } else if (info.action == "zimo") {
            str = "自摸";
          } else if (info.action == "ganghua") {
            str = "杠上花";
          } else if (info.action == "dianganghua") {
            str = "点杠花";
          } else if (info.action == "gangpaohu") {
            str = "杠炮胡";
          } else if (info.action == "qiangganghu") {
            str = "抢杠胡";
          } else if (info.action == "chadajiao") {
            str = "查大叫";
          }
        }
        str += "(";
        if (info.pattern == "7pairs") {
          str += "七对";
          sep = "、";
        } else if (info.pattern == "l7pairs") {
          str += "龙七对";
          sep = "、";
        } else if (info.pattern == "j7pairs") {
          str += "将七对";
          sep = "、";
        } else if (info.pattern == "duidui") {
          str += "碰碰胡";
          sep = "、";
        } else if (info.pattern == "jiangdui") {
          str += "将对";
          sep = "、";
        }
        if (info.haidihu) {
          str += sep + "海底胡";
          sep = "、";
        }
        if (info.tianhu) {
          str += sep + "天胡";
          sep = "、";
        }
        if (info.dihu) {
          str += sep + "地胡";
          sep = "、";
        }
        if (dataseat.qingyise) {
          str += sep + "清一色";
          sep = "、";
        }
        if (dataseat.menqing) {
          str += sep + "门清";
          sep = "、";
        }
        if (dataseat.jingouhu) {
          str += sep + "金钩胡";
          sep = "、";
        }
        if (dataseat.zhongzhang) {
          str += sep + "中张";
          sep = "、";
        }
        if (info.numofgen > 0) {
          str += sep + "根x" + info.numofgen;
          sep = "、";
        }
        if (sep == "") {
          str += "平胡";
        }
        str += "、" + info.fan + "番";
        str += ")";
        actionArr.push(str);
      }
      seatView.hu.active = hued;
      if (userData.angangs.length) {
        actionArr.push("暗杠x" + userData.angangs.length);
      }
      if (userData.diangangs.length) {
        actionArr.push("明杠x" + userData.diangangs.length);
      }
      if (userData.wangangs.length) {
        actionArr.push("巴杠x" + userData.wangangs.length);
      }
      seatView.username.string = AppGlobal.vv().gameNetMgr.seats[i].name;
      seatView.zhuang.active = AppGlobal.vv().gameNetMgr.button == i;
      seatView.reason.string = actionArr.join("、");
      if (userData.score > 0) {
        seatView.score.string = "+" + userData.score;
      } else {
        seatView.score.string = userData.score;
      }
      for (var k = 0; k < seatView.mahjongs.children.length; ++k) {
        var n = seatView.mahjongs.children[k];
        n.active = false;
      }
      AppGlobal.vv().mahjongmgr.sortMJ(userData.holds, userData.dingque);
      var numOfGangs =
        userData.angangs.length +
        userData.wangangs.length +
        userData.diangangs.length;
      var lackingNum = (userData.pengs.length + numOfGangs) * 3;
      for (var k = 0; k < userData.holds.length; ++k) {
        var pai = userData.holds[k];
        var n = seatView.mahjongs.children[k + lackingNum];
        n.active = true;
        var sprite = n.getComponent(Sprite);
        sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID(
          "M_",
          pai
        );
      }
      for (var k = 0; k < seatView._pengandgang.length; ++k) {
        seatView._pengandgang[k].active = false;
      }
      var index = 0;
      var gangs = userData.angangs;
      for (var k = 0; k < gangs.length; ++k) {
        var mjid = gangs[k];
        this.initPengAndGangs(seatView, index, mjid, "angang");
        index++;
      }
      var gangs = userData.diangangs;
      for (var k = 0; k < gangs.length; ++k) {
        var mjid = gangs[k];
        this.initPengAndGangs(seatView, index, mjid, "diangang");
        index++;
      }
      var gangs = userData.wangangs;
      for (var k = 0; k < gangs.length; ++k) {
        var mjid = gangs[k];
        this.initPengAndGangs(seatView, index, mjid, "wangang");
        index++;
      }
      var pengs = userData.pengs;
      if (pengs) {
        for (var k = 0; k < pengs.length; ++k) {
          var mjid = pengs[k];
          this.initPengAndGangs(seatView, index, mjid, "peng");
          index++;
        }
      }
    }
  }

  initPengAndGangs(seatView: any, index: any, mjid: any, flag: any) {
    var pgroot = null;
    if (seatView._pengandgang.length <= index) {
      pgroot = instantiate(AppGlobal.vv().mahjongmgr.pengPrefabSelf);
      seatView._pengandgang.push(pgroot);
      seatView.mahjongs.addChild(pgroot);
    } else {
      pgroot = seatView._pengandgang[index];
      pgroot.active = true;
    }
    var sprites = pgroot.getComponentsInChildren(Sprite);
    for (var s = 0; s < sprites.length; ++s) {
      var sprite = sprites[s];
      if (sprite.node.name == "gang") {
        var isGang = flag != "peng";
        sprite.node.active = isGang;
        sprite.node.scaleX = 1.0;
        sprite.node.scaleY = 1.0;
        if (flag == "angang") {
          sprite.spriteFrame =
            AppGlobal.vv().mahjongmgr.getEmptySpriteFrame("myself");
          sprite.node.scaleX = 1.4;
          sprite.node.scaleY = 1.4;
        } else {
          sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID(
            "B_",
            mjid
          );
        }
      } else {
        sprite.spriteFrame = AppGlobal.vv().mahjongmgr.getSpriteFrameByMJID(
          "B_",
          mjid
        );
      }
    }
    pgroot.x = index * 55 * 3 + index * 10;
  }

  onBtnReadyClicked() {
    console.log("onBtnReadyClicked");
    if (this._isGameEnd) {
      this._gameresult.active = true;
    } else {
      AppGlobal.vv().net.send("ready");
    }
    this._gameover.active = false;
  }

  onBtnShareClicked() {
    console.log("onBtnShareClicked");
  }
}
