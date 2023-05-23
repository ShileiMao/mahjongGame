import { _decorator, Component, Node } from 'cc';
import { Login } from '../views/login';
import { GameManager, GameStatus } from './GameManager';
import { HttpUtils } from '../network/HttpUtils';
import { API } from './API';
import { GameData } from './GameData';
const { ccclass, property } = _decorator;

export enum UI_CHANGE_EVENT {
    SHOW_LOGIN, 
    SHOW_LOADING, 
    SHOW_GAMING
}

@ccclass('UIManager')
export class UIManager extends Component {
    
    @property(Node)
    public loginView: Node = null;

    @property(Node)
    public hallView: Node = null;

    @property(Node)
    public connectingView: Node = null;


    // game logic
    @property(GameManager)
    public gameManager: GameManager = null;

    @property(GameData)
    public gameData: GameData = null;

    onLoad(): void {
        
    }

    start() {
        this.connectingView.active = true
        this._init();
    }

    update(deltaTime: number) {
    }

    private _init() {
        this.gameManager.setStatusListener(status => {
            console.log("++++ game status changed: " + status);
            this._handleGameStatus(status);
        })

        this.connectingView.active = true;
    }

    private _showLayer(event: UI_CHANGE_EVENT) {

    }

    private _handleGameStatus(status: GameStatus) {
        this.connectingView.active = false;
        this.loginView.active = false;

        if(status === GameStatus.CONNECTING) {
            this.connectingView.active = true;
        } else {
            this.connectingView.active = false;
        }

        if(status === GameStatus.NO_LOGIN || status === GameStatus.NO_USER) {
            this.loginView.active = true
            const loginNode = this.loginView.getChildByName("login");
            const loginComponent = loginNode.getComponent(Login);
            loginComponent.fetchUser()
        }

        if(status === GameStatus.LOG_IN) {
            this.hallView.active = true;
        }
    }
}

