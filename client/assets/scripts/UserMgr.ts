import { _decorator, Component, sys, utils, director } from "cc";
import { AppGlobal } from "./components/AppGlobal";
const { ccclass, property } = _decorator;

@ccclass("UserMgr")
export class UserMgr extends Component {
  @property
  public account = "null";
  @property
  public userId: number = null;
  @property
  public userName = "null";
  @property
  public lv = 0;
  @property
  public exp = 0;
  @property
  public coins = "";
  @property
  public gems = "";
  @property
  public sign = "";
  @property
  public salt = "";
  @property
  public ip = "";
  @property
  public sex = null;
  @property
  public roomData = null;
  @property
  public oldRoomId = null;

  @property
  public notice: { [key: string]: string };

  @property
  public gemstip: { [key: string]: string };

  guestAuth() {
    let account = sys.localStorage.getItem("account");
    if (account == null) {
      account = sys.localStorage.getItem("account");
    }
    if (account == null) {
      account = Date.now();
      sys.localStorage.setItem("account", account);
    }
    AppGlobal.vv().http.sendRequest(
      "/guest",
      { account: account },
      this.onAuth
    );
  }

  onAuth(ret: any) {
    var self = AppGlobal.vv().userMgr;
    if (ret.errcode !== 0) {
      console.log(ret.errmsg);
    } else {
      self.account = ret.account;
      self.sign = ret.sign;
      self.salt = ret.salt;
      console.log("server info: " + AppGlobal.vv().SI);
      AppGlobal.vv().http.url = AppGlobal.vv().SI.hall;
      self.login();
    }
  }

  login() {
    var self = this;
    var onLogin = (ret) => {
      if (ret.errcode !== 0) {
        console.log(ret.errmsg);
      } else {
        console.log("login response: ");
        console.log(ret);

        if (!ret.userid) {
            console.log("*****load screen createrole")
          director.loadScene("createrole");
        } else {
          console.log(ret);
          self.account = ret.account;
          self.userId = ret.userid;
          self.userName = ret.name;
          self.lv = ret.lv;
          self.exp = ret.exp;
          self.coins = ret.coins;
          self.gems = ret.gems;
          self.roomData = ret.roomid;
          self.sex = ret.sex;
          self.ip = ret.ip;
          console.log("*****load screen hall")
          director.loadScene("hall");
        }
      }
    };
    AppGlobal.vv().wc.show("正在登录游戏");
    AppGlobal.vv().http.sendRequest(
      "/login",
      { account: this.account, sign: this.sign, salt: this.salt },
      onLogin
    );
  }

  create(name: any) {
    var self = this;
    var onCreate = function (ret) {
      console.log("crate role response: ");
      console.log(ret);
      if (ret.errcode !== 0) {
        console.log(ret.errmsg);
      } else {
        self.login();
      }
    };
    var data = {
      account: this.account,
      sign: this.sign,
      name: name,
      salt: this.salt,
    };
    AppGlobal.vv().http.sendRequest("/create_user", data, onCreate);
  }

  enterRoom(roomId: string, callback?: (data: any) => void) {
    var self = this;
    var onEnter = function (ret) {
      if (ret.errcode !== 0) {
        if (ret.errcode == -1) {
          setTimeout(function () {
            self.enterRoom(roomId, callback);
          }, 5000);
        } else {
          AppGlobal.vv().wc.hide();
          if (callback) {
            callback(ret);
          }
        }
      } else {
        AppGlobal.vv().wc.hide();
        if (callback) {
          callback(ret);
        }

        console.log("*********** enter room ")
        AppGlobal.vv().gameNetMgr.connectGameServer(ret);
      }
    };
    var data = {
      account: AppGlobal.vv().userMgr.account,
      sign: AppGlobal.vv().userMgr.sign,
      roomid: roomId,
      salt: this.salt
    };
    AppGlobal.vv().wc.show("正在进入房间 " + roomId);
    AppGlobal.vv().http.sendRequest("/enter_private_room", data, onEnter);
  }

  getHistoryList(callback: any) {
    var self = this;
    var onGet = function (ret) {
      if (ret.errcode !== 0) {
        console.log(ret.errmsg);
      } else {
        console.log(ret.history);
        if (callback != null) {
          callback(ret.history);
        }
      }
    };
    var data = {
      account: AppGlobal.vv().userMgr.account,
      sign: AppGlobal.vv().userMgr.sign,
    };
    AppGlobal.vv().http.sendRequest("/get_history_list", data, onGet);
  }

  getGamesOfRoom(uuid: any, callback: any) {
    var self = this;
    var onGet = function (ret) {
      if (ret.errcode !== 0) {
        console.log(ret.errmsg);
      } else {
        console.log(ret.data);
        callback(ret.data);
      }
    };
    var data = {
      account: AppGlobal.vv().userMgr.account,
      sign: AppGlobal.vv().userMgr.sign,
      uuid: uuid,
    };
    AppGlobal.vv().http.sendRequest("/get_games_of_room", data, onGet);
  }

  getDetailOfGame(uuid: any, index: any, callback: any) {
    var self = this;
    var onGet = function (ret) {
      if (ret.errcode !== 0) {
        console.log(ret.errmsg);
      } else {
        console.log(ret.data);
        callback(ret.data);
      }
    };
    var data = {
      account: AppGlobal.vv().userMgr.account,
      sign: AppGlobal.vv().userMgr.sign,
      uuid: uuid,
      index: index,
    };
    AppGlobal.vv().http.sendRequest("/get_detail_of_game", data, onGet);
  }
}
