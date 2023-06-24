import { UserMgr } from '../UserMgr';
import { ReplayMgr } from '../ReplayMgr';
import { HTTP } from '../HTTP';
import { Net } from '../Net';
import { GameNetMgr } from '../GameNetMgr';
import { AnysdkMgr } from '../AnysdkMgr';
import { VoiceMgr } from '../VoiceMgr';
import { AudioMgr } from '../AudioMgr';
import { Utils } from '../Utils';
import { WaitingConnection } from './WaitingConnection';
import { Chat } from './Chat';
import { MahjongMgr } from '../MahjongMgr';
import { Alert } from './Alert';
import { UserInfoShow } from './UserInfoShow';
import { PopupMgr } from './PopupMgr';
import { RadioGroupMgr } from './RadioGroupMgr';

type VModel = {
  alert: Alert,
  userMgr: UserMgr,
  replayMgr: ReplayMgr,
  gameNetMgr: GameNetMgr,
  anysdkMgr: AnysdkMgr,
  voiceMgr: VoiceMgr,
  audioMgr: AudioMgr,
  utils: Utils,
  VERSION: string,
  SI: {version: string,
		hall: string,
		appweb: string }, // server info
  http: HTTP,
  wc: WaitingConnection,
  chat: Chat,
  mahjongmgr: MahjongMgr,
  net: Net,
  images: any,
  baseInfoMap: any,
  userinfoShow: UserInfoShow,
  popupMgr: PopupMgr,
  radiogroupmgr: RadioGroupMgr
}

console.log("************************888*******");

(window as any).VModel = {
  alert: new Alert(),
  userMgr: new UserMgr(),
  replayMgr: new ReplayMgr(),
  gameNetMgr: new GameNetMgr(),
  // anysdkMgr: new AnysdkMgr(),
  voiceMgr: new VoiceMgr(),
  audioMgr: AudioMgr.instance,
  utils: new Utils(),
  VERSION: '20161227',
  SI: null,
  http: new HTTP(),
  wc: new WaitingConnection(),
  chat: null,
  mahjongmgr: null,
  net: new Net("localhost: 9000"), // ??
  images: {},
  baseInfoMap: null,
  userinfoShow: null,
  popupMgr: null,
  radiogroupmgr: null
}

// (window as any).VModel.audioMgr.init()

console.log("************************777********");

export class AppGlobal {
  static vv = () => {
      return (window as any).VModel as VModel
  }
}