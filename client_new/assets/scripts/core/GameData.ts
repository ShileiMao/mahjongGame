import { _decorator, Component } from "cc";
import { Storage } from "../utils/Storage";
const { ccclass } = _decorator;

export enum Gender {
  MALE,
  FEMALE
}

export interface UserInfo {
  account?: string, 
  password?: string, 
  name?: string, 
  gender?: Gender,
  coins?: string,
  gems?: string, 
  roomid?: string,
  sign?: string,
  salt?: string
}

@ccclass("GameData")
export class GameData extends Component {
  public userData: UserInfo; 

  /**
   * This is the hall server info, retriving from /get_serverinfo API
   */
  public hallServerInfo: {version: string, hall: string, webapp: string} = null;

  private _storage: Storage = new Storage();

  public loadCachedData() {
    const userData = this._storage.loadUserData();
    this.userData = userData;
  }

  public persistData() {
    this._storage.storeUserData(this.userData);
  }

  protected onLoad(): void {
    console.log("game data onload!!!!!!!!!!!");
    this.loadCachedData();
  }
}