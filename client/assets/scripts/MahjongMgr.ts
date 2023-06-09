import { _decorator, Component, SpriteAtlas, Prefab, SpriteFrame } from "cc";
import { AppGlobal } from "./components/AppGlobal";
const { ccclass, property } = _decorator;

let mahjongSprites: string[] = [];
@ccclass("MahjongMgr")
export class MahjongMgr extends Component {
  @property(SpriteAtlas)
  public leftAtlas: SpriteAtlas = null;
  @property(SpriteAtlas)
  public rightAtlas: SpriteAtlas = null;
  @property(SpriteAtlas)
  public bottomAtlas: SpriteAtlas = null;
  @property(SpriteAtlas)
  public bottomFoldAtlas: SpriteAtlas = null;
  @property(Prefab)
  public pengPrefabSelf: Prefab = null;
  @property(Prefab)
  public pengPrefabLeft: Prefab = null;
  @property(SpriteAtlas)
  public emptyAtlas: SpriteAtlas = null;
  @property(SpriteFrame)
  public holdsEmpty: SpriteFrame[] = [];
  private _sides: string[] = [];
  private _pres: string[] = [];
  private _foldPres: string[] = [];

  onLoad() {
    this._sides = ["myself", "right", "up", "left"];
    this._pres = ["M_", "R_", "B_", "L_"];
    this._foldPres = ["B_", "R_", "B_", "L_"];
    AppGlobal.vv().mahjongmgr = this;
    for (var i = 1; i < 10; ++i) {
      mahjongSprites.push("dot_" + i);
    }
    for (var i = 1; i < 10; ++i) {
      mahjongSprites.push("bamboo_" + i);
    }
    for (var i = 1; i < 10; ++i) {
      mahjongSprites.push("character_" + i);
    }
    mahjongSprites.push("red");
    mahjongSprites.push("green");
    mahjongSprites.push("white");
    mahjongSprites.push("wind_east");
    mahjongSprites.push("wind_west");
    mahjongSprites.push("wind_south");
    mahjongSprites.push("wind_north");
  }

  getMahjongSpriteByID(id: number) {
    return mahjongSprites[id];
  }

  getMahjongType(id: number) {
    if (id >= 0 && id < 9) {
      return 0;
    } else if (id >= 9 && id < 18) {
      return 1;
    } else if (id >= 18 && id < 27) {
      return 2;
    }
  }

  // 获取麻将对应的sprite frame
  getSpriteFrameByMJID(pre: any, mjid: any) {
    var spriteFrameName = this.getMahjongSpriteByID(mjid);
    spriteFrameName = pre + spriteFrameName;
    if (pre == "M_") {
      return this.bottomAtlas.getSpriteFrame(spriteFrameName);
    } else if (pre == "B_") {
      return this.bottomFoldAtlas.getSpriteFrame(spriteFrameName);
    } else if (pre == "L_") {
      return this.leftAtlas.getSpriteFrame(spriteFrameName);
    } else if (pre == "R_") {
      return this.rightAtlas.getSpriteFrame(spriteFrameName);
    }
  }

  getAudioURLByMJID(id: any) {
    var realId = 0;
    if (id >= 0 && id < 9) {
      realId = id + 21;
    } else if (id >= 9 && id < 18) {
      realId = id - 8;
    } else if (id >= 18 && id < 27) {
      realId = id - 7;
    }
    return "nv/" + realId + ".mp3";
  }

  // 白板或者对方手牌
  getEmptySpriteFrame(side: any) {
    if (side == "up") {
      return this.emptyAtlas.getSpriteFrame("e_mj_b_up");
    } else if (side == "myself") {
      return this.emptyAtlas.getSpriteFrame("e_mj_b_bottom");
    } else if (side == "left") {
      return this.emptyAtlas.getSpriteFrame("e_mj_b_left");
    } else if (side == "right") {
      return this.emptyAtlas.getSpriteFrame("e_mj_b_right");
    }
  }

  getHoldsEmptySpriteFrame(side: any) {
    if (side == "up") {
      return this.emptyAtlas.getSpriteFrame("e_mj_up");
    } else if (side == "myself") {
      return null;
    } else if (side == "left") {
      return this.emptyAtlas.getSpriteFrame("e_mj_left");
    } else if (side == "right") {
      return this.emptyAtlas.getSpriteFrame("e_mj_right");
    }
  }

  sortMJ(mahjongs: number[], dingque: number) {
    var self = this;
    mahjongs.sort(function (a: number, b: number) {
      if (dingque >= 0) {
        var t1 = self.getMahjongType(a);
        var t2 = self.getMahjongType(b);
        if (t1 != t2) {
          if (dingque == t1) {
            return 1;
          } else if (dingque == t2) {
            return -1;
          }
        }
      }
      return a - b;
    });
  }

  getSide(localIndex: number) {
    return this._sides[localIndex];
  }

  getPre(localIndex: number) {
    return this._pres[localIndex];
  }

  getFoldPre(localIndex: number) {
    return this._foldPres[localIndex];
  }
}
