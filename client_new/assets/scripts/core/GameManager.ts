import { _decorator, Component, Node } from 'cc';
import { UIManager } from './UIManager';
import { GameData } from './GameData';
import { API } from './API';
import { StringUtils } from '../utils/StringUtils';
const { ccclass, property } = _decorator;

export enum GameStatus {
    CONNECTING,
    LOADING,
    NO_LOGIN,
    NO_USER,
    LOG_IN, 
    PLAYING,
}


@ccclass('GameManager')
export class GameManager extends Component {
    private _status: GameStatus = GameStatus.CONNECTING;
    private _gameStatusListener: (status: GameStatus) => void = null;

    @property(GameData)
    public gameData: GameData = null;

    protected onLoad(): void {
        
    }

    start() {
        const apiHandler = new API();
        apiHandler.getServerInfo((resp, error) => {
            if(error) {
                console.log("error");
                return;
            }
            console.log("got server info: " + resp.responseText);
            const serverInfo = JSON.parse(resp.responseText);
            this.gameData.hallServerInfo = serverInfo;

            if(this.gameData.userData === null) {
                console.log("------ no login 1")
                this.setGameStatus(GameStatus.NO_LOGIN);
                return
            }
            
            if(StringUtils.isEmpty(this.gameData.userData.account)) {
                console.log("------ no login 2")
                this.setGameStatus(GameStatus.NO_LOGIN);
                return
            }

            if(StringUtils.isEmpty(this.gameData.userData.name)) {
                console.log("------ no user")
                this.setGameStatus(GameStatus.NO_USER);
                return
            }
            
        })
    }


    public setStatusListener(listener: (status: GameStatus) => void) {
        this._gameStatusListener = listener;
    }

    public setGameStatus(state: GameStatus) {
        this._status = state;
        this._notifyStatusChanged();
    }
    
    public getGameStatus(): GameStatus {
        return this._status;
    }

    private _notifyStatusChanged() {
        if(this._gameStatusListener !== null) {
            this._gameStatusListener(this._status);
        }
    }

}

