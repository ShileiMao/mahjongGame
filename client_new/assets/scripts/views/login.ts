import { _decorator, Button, Component, EditBox, EventHandler, Game, Node } from 'cc';
import { Utils } from '../utils/Utils';
import { HttpUtils } from '../network/HttpUtils';
import { API, APIResponse } from '../core/API';
import { GameManager, GameStatus } from '../core/GameManager';
import { GameData, Gender } from '../core/GameData';
const { ccclass, property } = _decorator;



@ccclass('Login')
export class Login extends Component {
    static TAG_REGISTARION = "tag_registration";
    static TAG_USERNAME_CHANGED = "TAG_USERNAME_CHANGED"

    static TAG_GENDER_MALE_CLICKED = "TAG_GENDER_MALE_CLICKED";
    static TAG_GENDER_FEMALE_CLICKED = "TAG_GENDER_FEMALE_CLICKED";

    @property(Button)
    public btnLogin: Button;

    @property(Button)
    public btnRegistration: Button;

    @property(EditBox)
    public etAccountName: EditBox;

    @property(EditBox)
    public etPassword: EditBox;

    @property(EditBox)
    public etUserName: EditBox

    @property(Button)
    public btnGenderBody: Button

    @property(Button)
    public btnGenderGirl: Button

    @property(Button)
    public btnCreateUser: Button

    // layout
    @property(Node)
    public loginAccountLayout: Node

    @property(Node)
    public createUserLayout: Node

    // game related 
    @property(GameData)
    public gameData: GameData = null;

    @property(GameManager)
    public gameManager: GameManager = null;


    // private properties
    private _utils: Utils = new Utils();
    private _httpUtils: HttpUtils = new HttpUtils();

    private _accountName: string = '';
    private _password: string = '';

    // for gaming
    private _username: string = ''
    private _gender: Gender = Gender.MALE;

    start() {
        this._utils.addClickEvent(this.btnLogin, this.node, "Login", "_onScreenCallback", "login");
        this._utils.addTextChangedEvent(this.etAccountName, this.node, "Login", "_onEditBoxChanged", "etAccountName");
        this._utils.addTextChangedEvent(this.etPassword, this.node, "Login", "_onEditBoxChanged", "etPassword");
        this._utils.addTextChangedEvent(this.etUserName, this.node, "Login", "_onEditBoxChanged", Login.TAG_USERNAME_CHANGED);
        this._utils.addClickEvent(this.btnRegistration, this.node, "Login", "_onScreenCallback", Login.TAG_REGISTARION)
    }

    public fetchUser() {
        if(this.gameManager.getGameStatus() === GameStatus.NO_LOGIN) {
            console.log("----- no account");
            this.loginAccountLayout.active = true;
            this.createUserLayout.active = false;
        } else if(this.gameManager.getGameStatus() === GameStatus.NO_USER){
            console.log("----- no user");
            this.loginAccountLayout.active = false;
            this.createUserLayout.active = true;
        }

        console.log("0000000 login account: " + this.gameData.userData);
        if(this.gameData.userData !== null && this.gameData.userData.account !== null && this.gameData.userData.password !== null) {
            this.loginAccount(this.gameData.userData.account, this.gameData.userData.password);
        }
    }

    createUser(event: Event, customData: string) {
        console.log("create user clicked!");
        const account = this.gameData.userData.account;

        const api = new API(this.gameData.hallServerInfo.hall)
        api.registerUser({account: account, name: this._username, gender: this._gender}, (resp, error) => {
            if(error !== null) {
                console.error("failed to create user: " + error);
                return
            }
            console.log("crated user: " + resp.responseText);

            this.loginToHall(account)
        })
    }

    private _onScreenCallback(event: Event, customData: string) {
        if(customData === 'login') {
            console.log("login1 clicked, username: " + this._accountName + ", password: " + this._password);
            this.loginAccount(this._accountName, this._password);
        }

        if (customData === Login.TAG_REGISTARION) {
            console.log("login1 clicked, username: " + this._accountName + ", password: " + this._password);
            const apiHandler = new API();
            apiHandler.registerAccount({account: this._accountName, password: this._password}, (resp, error) => {
                if(error != null) {
                    console.log("error: " + error);
                    return;
                }

                console.log("response: " + resp.responseText);
            })
        }

        if(customData === Login.TAG_GENDER_FEMALE_CLICKED) {
            this._gender = Gender.FEMALE;
            return
        }

        if(customData === Login.TAG_GENDER_MALE_CLICKED) {
            this._gender = Gender.MALE;
            return;
        }
    }

    private _onEditBoxChanged(text: string, editBox: EditBox, customEventData: string) {
        if(customEventData === 'etAccountName') {
            this._accountName = text;
            return;
        }
        if(customEventData == 'etPassword') {
            this._password = text;
            return;
        }
        if(customEventData === Login.TAG_USERNAME_CHANGED) {
            this._username = text;
            return;
        }
    }

    private loginAccount(account: string, password: string) {
        const apiHandler = new API(this.gameData.hallServerInfo.hall);
        apiHandler.auth({account: account, password: password}, (respo, error) => {
            if(error !== null) {
                console.error("error login:" + error);
                return;
            }

            const authResp = JSON.parse(respo.responseText);
            if(authResp.errcode !== 0) {
                console.error("failed to authenticate: " + authResp.errmsg);
                return
            }

            console.log("----- account login, response: " + respo.responseText);

            const userInfo = {
                ...this.gameData.userData,
                ...authResp,
                password: password
            }

            this.gameData.userData = userInfo;
            this.gameData.persistData()
            this.loginToHall(account);
        })
    }

    private loginToHall(account: string) {
        const apiHandler = new API(this.gameData.hallServerInfo.hall);
        const salt = this.gameData.userData.salt;
        const sign = this.gameData.userData.sign;

        console.log("****** login the hall: " + this.gameData.userData);

        apiHandler.loginAccount({account: account, sign: sign, salt: salt}, (resp, error) => {
            if(error != null) {
                console.error("error login:" + error);
                return;
            }

            const loginResp = JSON.parse(resp.responseText);
            if(loginResp.account !== null && loginResp.account !== undefined) {
                // 用户存在
                const userInfo = {
                    ...this.gameData.userData,
                    account: loginResp.account, 
                    name: loginResp.name, 
                    coins: loginResp.coins,
                    gems: loginResp.gems, 
                    roomid: loginResp.roomid
                }
                console.log("user info: " + userInfo);

                this.gameData.userData = userInfo;

                this.gameManager.setGameStatus(GameStatus.LOG_IN);
                return
            }
            // 玩家不存在，需要创建
            const userData = {...this.gameData.userData};
            this.gameData.userData = userData;
            this.gameManager.setGameStatus(GameStatus.NO_USER);

            this.loginAccountLayout.active = false;
            this.createUserLayout.active = true;
        })
    }

}

