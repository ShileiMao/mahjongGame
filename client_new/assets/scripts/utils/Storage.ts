import { Component, _decorator, sys } from "cc";
const {ccclass} = _decorator;

@ccclass("Storage")
export class Storage extends Component {
  static STORE_USER_INFO = "store_user_info";

  public loadData(key: string): string {
    const userData = sys.localStorage.getItem(key);
    if(userData === null || userData === undefined || userData === "") {
      return ""
    }
    return userData;
  }

  public storeData(key: string, value: string) {
    sys.localStorage.setItem(key, value);
  }

  public storeUserData(userData: object) {
    if(userData === null || userData === undefined) {
      console.warn("there is no user data to store");
      return 
    }

    sys.localStorage.setItem(Storage.STORE_USER_INFO, JSON.stringify(userData));
  }


  public loadUserData() {
    const userData = this.loadData(Storage.STORE_USER_INFO);
    if(userData === "") {
      return null
    }
    
    const userObj = JSON.parse(userData);
    return userObj;
  }
}