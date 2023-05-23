import { _decorator, Button, Component, EditBox, error, Node, SpriteFrame } from 'cc';
import { GameManager } from '../core/GameManager';
import { RoomConfig, RoomType } from '../core/GameConfig';
import { API } from '../core/API';


const { ccclass, property } = _decorator;

@ccclass('Hall')
export class Hall extends Component {
    static TAG_SHOW_NUMBER_PAD = "SHOW_NUMBER_PAD";
    static TAG_ROOM_NUMBER_TYPING = "TAG_ROOM_NUMBER_TYPING";
    static TAG_ENGER_ROOM = "TAG_ENGER_ROOM";

    @property(GameManager)
    public gameManager: GameManager;

    @property(Node)
    public numberPad: Node;

    private _roomNumber: string;
    
    start() {
        console.log("connect socket");
    }

    update(deltaTime: number) {
        
    }

    onBtnClicked(event: Event, customData: string) {
        if(customData === Hall.TAG_SHOW_NUMBER_PAD) {
            this.numberPad.active = true;
            return;
        }

        if(customData === Hall.TAG_ENGER_ROOM) {
            // const userInfo = {
            //     account: this.gameManager.gameData.userData.account,
            //     salt: this.gameManager.gameData.userData.salt, 
            //     sign: this.gameManager.gameData.userData.sign,
            //     roomid: this._roomNumber
            // }
            // const api = new API(this.gameManager.gameData.hallServerInfo.hall);
            // api.enterPrivateRoom(userInfo, (response, error) => {
            //     if(error) {
            //         console.log(error);
            //         return;
            //     }

            //     console.log("response: " + JSON.stringify(response.responseText));
            // })

            const roomConf = new RoomConfig();
            const userInfo = {
                account: this.gameManager.gameData.userData.account,
                salt: this.gameManager.gameData.userData.salt, 
                sign: this.gameManager.gameData.userData.sign,
                conf: JSON.stringify(roomConf)
            }
            console.log("roomConf: " + JSON.stringify(roomConf));

            const api = new API(this.gameManager.gameData.hallServerInfo.hall);
            api.createPrivateRoom(userInfo, (response, error) => {
                if(error) {
                    console.log(error);
                    return;
                }

                console.log("response: " + JSON.stringify(response.responseText));
            })
        }
    }
    onRoomNumberTextChange(text: string, textBox: EditBox, customData: string) {
        if(customData === Hall.TAG_ROOM_NUMBER_TYPING) {
            this._roomNumber = text;
        }
    }
}

