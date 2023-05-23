import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum CardCode {
    /**
     * 万字
     */
    W_1 = 21,
    W_2 = 22,
    W_3 = 23,
    W_4 = 24,
    W_5 = 25,
    W_6 = 26,
    W_7 = 27,
    W_8 = 28,
    W_9 = 29, 

    /**
     * 条字
     */
    T_1 = 31,
    T_2 = 32,
    T_3 = 33,
    T_4 = 34,
    T_5 = 35,
    T_6 = 36,
    T_7 = 37,
    T_8 = 38,
    T_9 = 39,

    /**
     * 饼（筒）字
     */
    B_1 = 11,
    B_2 = 12,
    B_3 = 13,
    B_4 = 14,
    B_5 = 15,
    B_6 = 16,
    B_7 = 17,
    B_8 = 18,
    B_9 = 19,
    
    EAST = 41,
    SOUTH = 42, 
    WEST = 43, 
    NORTH = 44, 
    CENTER = 45,
    FA = 46,
    WHITE = 47, 

    /**
     * 未知牌（对方手牌）
     */
    UNKNOWN = '00'
}

export enum CardType {
    HANDCARD,
    INVISIBLE,
    VISIBLE,
}

export type PlayerCards = {
    handCards: CardCode[], 
    discardCards: CardCode[],
    gangCards: CardCode[],
    chiCards: CardCode[],
}

enum SkillEffects {
    GANG = 1, // 杠牌
    CHI = 2, // 吃牌
    HU = 3,  // 胡牌
    NONE = 100 // 无
}

export type PlayerInfo = {
    id: string,
    gender: string,
    name: string, 
    profileUrl: string, 
    ready: boolean,
    seat: number
}

export enum PlayerSeat {
    TOP = 1,
    LEFT = 2,
    BOTTOM = 3,
    RIGHT = 4,
}

@ccclass('GameLogic')
export class GameLogic extends Component {
    @property([Label])
    public nums: [Label] = null

    private _playerCards: {[key:string]: PlayerCards} = {};
    private _skillEfect: SkillEffects
    private _playersInfo: PlayerInfo[] = []
    private _currentPlayerSeat: number = 0
    private _started: boolean = false;


    protected start(): void {
        this.initFakeData();
        console.log("game logic, init fake data!")
    }

    public isStarted(): boolean {
        return this._started;
    }

    public getPlayerCards(playerId: string): PlayerCards | null {
        const cards = this._playerCards[playerId];
        if(cards !== undefined) {
            return cards;
        }

        return null;
    }

    public getPlayerInfo(playerId: string): PlayerInfo | null {
        const userInfo = this._playersInfo.find(userInfo => {
            if(userInfo.id === playerId) {
                return true;
            }
            return false;
        })
        
        return userInfo;
    }

    public getAllPlayersInfo(): PlayerInfo[] {
        console.log("get all players info")
        return this._playersInfo;
    }

    private initFakeData(): void {
        const player1Cards: PlayerCards = {
            handCards: [CardCode.W_1, CardCode.W_2, CardCode.W_3, CardCode.W_4, CardCode.W_5, CardCode.W_6, CardCode.W_7, CardCode.W_8, CardCode.W_9],
            discardCards: [CardCode.T_1, CardCode.T_2, CardCode.T_3, CardCode.T_4, CardCode.T_5, CardCode.T_6, CardCode.T_7, CardCode.T_8, CardCode.T_9],
            gangCards: [CardCode.B_1, CardCode.B_2, CardCode.B_3, CardCode.B_4, CardCode.B_5, CardCode.B_6, CardCode.B_7, CardCode.B_8, CardCode.B_9],
            chiCards: []
        }

        const player2Cards: PlayerCards = {
            handCards: [CardCode.W_1, CardCode.W_2, CardCode.W_3, CardCode.W_4, CardCode.W_5, CardCode.W_6, CardCode.W_7, CardCode.W_8, CardCode.W_9],
            discardCards: [CardCode.T_1, CardCode.T_2, CardCode.T_3, CardCode.T_4, CardCode.T_5, CardCode.T_6, CardCode.T_7, CardCode.T_8, CardCode.T_9],
            gangCards: [CardCode.B_1, CardCode.B_2, CardCode.B_3, CardCode.B_4, CardCode.B_5, CardCode.B_6, CardCode.B_7, CardCode.B_8, CardCode.B_9],
            chiCards: []
        }


        const player3Cards: PlayerCards = {
            handCards: [CardCode.W_3, CardCode.W_2, CardCode.W_3, CardCode.W_4, CardCode.W_5, CardCode.W_6, CardCode.W_7, CardCode.W_8, CardCode.W_9],
            discardCards: [CardCode.T_1, CardCode.T_2, CardCode.T_3, CardCode.T_4, CardCode.T_5, CardCode.T_6, CardCode.T_7, CardCode.T_8, CardCode.T_9],
            gangCards: [CardCode.B_1, CardCode.B_2, CardCode.B_3, CardCode.B_4, CardCode.B_5, CardCode.B_6, CardCode.B_7, CardCode.B_8, CardCode.B_9],
            chiCards: []
        }

        const player4Cards: PlayerCards = {
            handCards: [CardCode.W_2, CardCode.W_2, CardCode.W_3, CardCode.W_4, CardCode.W_5, CardCode.W_6, CardCode.W_7, CardCode.W_8, CardCode.W_9],
            discardCards: [CardCode.T_1, CardCode.T_2, CardCode.T_3, CardCode.T_4, CardCode.T_5, CardCode.T_6, CardCode.T_7, CardCode.T_8, CardCode.T_9],
            gangCards: [],
            chiCards: [CardCode.B_1, CardCode.B_2, CardCode.B_3, CardCode.B_4, CardCode.B_5, CardCode.B_6, CardCode.B_7, CardCode.B_8, CardCode.B_9]
        }


        this._playerCards = {
            "1": player1Cards,
            "2": player2Cards,
            "3": player3Cards,
            "4": player4Cards
        };

        const player1 = {
            id: "1",
            gender: "male",
            name: "player1", 
            profileUrl: "url1", 
            ready: true,
            seat: PlayerSeat.TOP
        }

        const player2 = {
            id: "2",
            gender: "male",
            name: "player1", 
            profileUrl: "url1", 
            ready: true,
            seat: PlayerSeat.LEFT
        }

        const player3 = {
            id: "3",
            gender: "male",
            name: "player1", 
            profileUrl: "url1", 
            ready: true,
            seat: PlayerSeat.RIGHT
        }

        const player4 = {
            id: "4",
            gender: "male",
            name: "player1", 
            profileUrl: "url1", 
            ready: true,
            seat: PlayerSeat.BOTTOM
        }

        this._playersInfo = [player1, player2, player3, player4]

    }
}

