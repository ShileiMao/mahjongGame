import { HttpUtils } from "../network/HttpUtils";
import { Config } from "./Config";
import { RoomType } from "./GameConfig";

export class APIResponse {
  public response: Response;
  public responseText: string;
}

export class API {
  private serverUrl: string = Config.accountSeverUrl;
  private hallServerUrl: string = "";

  constructor(hallUrl: string = null) {
    if(hallUrl !== null) {
      this.hallServerUrl = hallUrl;
    } 
  }
  private http: HttpUtils = new HttpUtils();

  public getServerVeresion(callback: (response: APIResponse, error: any) => void) {
    const url = this.serverUrl + "/get_version"
    const promise = this.http.get(url, null)
    this.generalResponseHandler(promise, callback);
  }

  public getServerInfo(callback: (response: APIResponse, error: any) => void) {
    const url = this.serverUrl + "/get_serverinfo";
    const reponse = this.http.get(url, null);
    this.generalResponseHandler(reponse, callback);
  }

  // user account related
  public registerAccount(accountInfo: {account: string, password: string}, callback: (response: APIResponse, error: any) => void) {
    const url = this.serverUrl + "/register";
    const response = this.http.get(url, accountInfo);
    this.generalResponseHandler(response, callback);
  }

  public registerUser(userInfo: {account: string, name: string, gender: number}, callback: (response: APIResponse, error: any) => void) {
    const url = this.hallServerUrl + "/create_user";
    const response = this.http.get(url, userInfo);
    this.generalResponseHandler(response, callback);
  }

  public auth(accountInfo: {account: string, password: string}, callback: (response: APIResponse, error: any) => void) {
    const url = this.serverUrl + "/auth";
    const response = this.http.get(url, accountInfo);
    this.generalResponseHandler(response, callback);
  }

  public loginAccount(accountInfo: {account: string, sign: string, salt: string}, callback: (response: APIResponse, error: any) => void) {
    const url = this.hallServerUrl + "/login";
    const response = this.http.get(url, accountInfo);
    this.generalResponseHandler(response, callback);
  }

  public createPrivateRoom(accountInfo: {account: string, salt: string, sign: string, conf: string}, callback: (response: APIResponse, error: any) => void) { 
    const url = this.hallServerUrl + "/create_private_room";
    const response = this.http.get(url, accountInfo);
    this.generalResponseHandler(response, callback);
  }
  
  public enterPrivateRoom(userInfo: {account: string, salt: string, sign: string, roomid: string}, callback: (response: APIResponse, error: any) => void) {
    const url = this.hallServerUrl + "/enter_private_room";
    const response = this.http.get(url, userInfo);
    this.generalResponseHandler(response, callback);
  }
  
  private generalResponseHandler(promise: Promise<Response>, callback: (response: APIResponse, error: any) => void) {
    promise.then((resp) => {
      resp.text()
      .then(text => {
        callback({response: resp, responseText: text}, null)
      })
      .catch(error => {
        callback(null, error);
      })
    })
    .catch(error => {
      callback(null, error);
    })
  }
}