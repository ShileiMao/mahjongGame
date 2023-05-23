import { _decorator, Component, instantiate, Layout, nextPow2, Node, Prefab, resources, Size, Sprite, SpriteFrame, UITransform } from 'cc';
import { GameLogic, PlayerInfo } from '../core/GameLogic';
import { PlayerSeat } from '../core/GameLogic';
import { Utils } from '../utils/Utils';
import { ImageLoader } from '../utils/ImageLoader';
import { CardType } from '../core/GameLogic';
const { ccclass, property } = _decorator;

@ccclass('GameSenceneUI')
export class GameSenceneUI extends Component {
    @property(Layout)
    public topCardsLayout: Layout
        @property(Layout)
        public lTopHandCard: Layout;
        @property(Layout)
        public lTopGangCard: Layout;

    @property(Node)
    public topDiscardCardsLayout: Node

    @property(Layout)
    public leftCardsLayout: Layout 
        @property(Layout)
        public lLeftHandCard: Layout;
        @property(Layout)
        public lLeftGangCard: Layout;
    
    @property(Node)
    public lefDiscardCardsLayout: Node
    
    @property(Layout)
    public rightCardsLayout: Layout
        @property(Layout)
        public lRightHandCard: Layout;
        @property(Layout)
        public lRightGangCard: Layout;
    
    @property(Node)
    public rightDiscardCardsLayout: Node

    @property(Layout)
    public bottomCardsLayout: Layout
        @property(Layout)
        public lBottomHandCard: Layout;
        @property(Layout)
        public lBottomGangCard: Layout;
    
    @property(Node)
    public bottomDiscardCardsLayout: Node


    @property(Prefab)
    public lHandCardprefab: Prefab

    @property(Prefab)
    public rHandcardPrefab: Prefab

    @property(Prefab)
    public lrGangCardPrefab: Prefab

    @property(Prefab)
    public topHandCardPrefab: Prefab

    @property(Prefab)
    public topGangCardPrefab: Prefab

    @property(Prefab)
    public bottomHandCardPrefab: Prefab;

    @property(Prefab)
    public bottomGangCardPrefab: Prefab

    @property(GameLogic)
    public gameLogic: GameLogic;

    private _topBottomCardSize: Size = new Size(40, 60);
    private _topBottomGangCardSize: Size = new Size(40, 60)
    private _leftRightCardSize: Size = new Size(35, 64)
    private _leftRightGangCardSize: Size = new Size(40, 30)
    
    private _topBottomDiscardCardSize: Size = new Size(40, 60);
    private _sideDiscoardCardSize: Size = new Size(40, 30)

    private _leftRightHandCardLayoutVGap = -40;
    private _leftRightGangCardLayoutVGap = -10;

    private _topBottomCardsLayoutGap = 10;
    private _leftRightCardsLayoutGap = 10;

    private _discardedCardsPerLine = 13

    start() {
        this._refreshPlayerCards();
    }

    update(deltaTime: number) {
        
    }

    private _refreshPlayerCards() {
        const allPlayers = this.gameLogic.getAllPlayersInfo();
        console.log("refresh player cards")
        this.layoutPlayerCards(allPlayers);
    }

    private _cardsVGapCount = (cardsCount: number) => {
        return Math.max(cardsCount - 1, 0)
    }


    private _setLayoutContentSize = (layout: Node, contentSize: Size) => {
        let transform = layout.getComponent(UITransform);
        if(transform !== null) {
            transform.setContentSize(contentSize);
        }
    }


    private layoutPlayerCards(allPlayers: PlayerInfo[]) {
        allPlayers.forEach(player => {
            console.log("player: " + player);
            const playerCards = this.gameLogic.getPlayerCards(player.id);
            let handCardSize = this._topBottomCardSize;
            let gangCardSize = this._topBottomGangCardSize;
            
            if(player.seat === PlayerSeat.LEFT || player.seat === PlayerSeat.RIGHT) {
                handCardSize = this._leftRightCardSize;
                gangCardSize = this._leftRightGangCardSize;
                
                const totalHandCardHeight = playerCards.handCards.length * handCardSize.height + 
                this._cardsVGapCount(playerCards.handCards.length) * this._leftRightHandCardLayoutVGap;

                const totalGangCardHeight = this._cardsVGapCount(playerCards.gangCards.length + playerCards.chiCards.length) * this._leftRightGangCardLayoutVGap + 
                    playerCards.gangCards.length * this._leftRightGangCardSize.height +
                    playerCards.chiCards.length * this._leftRightGangCardSize.height;

                const totalLayoutWidth = Math.max(handCardSize.width, gangCardSize.width);

                if(player.seat === PlayerSeat.LEFT) {
                    this._setLayoutContentSize(this.lLeftHandCard.node, new Size(handCardSize.width, totalHandCardHeight));
                    this._setLayoutContentSize(this.lLeftGangCard.node, new Size(gangCardSize.width, totalGangCardHeight));
                    this._setLayoutContentSize(this.leftCardsLayout.node, new Size(totalLayoutWidth, totalHandCardHeight + totalGangCardHeight))

                    this.lLeftHandCard.node.removeAllChildren();
                    this.lLeftGangCard.node.removeAllChildren();
                    this.lefDiscardCardsLayout.removeAllChildren();

                    for(const handCard of playerCards.handCards) {
                        const leftHandCard = instantiate(this.lHandCardprefab);
                        ImageLoader.refreshMahjongSprite(leftHandCard, handCard, CardType.HANDCARD, player.seat);
                        this.lLeftHandCard.node.addChild(leftHandCard)
                    }

                    for(const gangCard of playerCards.gangCards) {
                        const lLeftGangCard = instantiate(this.lrGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(lLeftGangCard, gangCard, CardType.VISIBLE, player.seat);
                        this.lLeftGangCard.node.addChild(lLeftGangCard);
                    }

                    for(const chicard of playerCards.chiCards) {
                        const lLeftChiCard = instantiate(this.lrGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(lLeftChiCard, chicard, CardType.VISIBLE, player.seat);
                        this.lLeftGangCard.node.addChild(lLeftChiCard);
                    }
                    Utils.updatePosition(this.leftCardsLayout.node, {y: 0})

                    // 弃牌layout
                    let totalHeight = this._sideDiscoardCardSize.width * (this._discardedCardsPerLine - 1);
                    let totalCol = Math.ceil(playerCards.discardCards.length / this._discardedCardsPerLine) + (playerCards.discardCards.length % this._discardedCardsPerLine > 0 ? 1 : 0);
                    let totalWidth = totalCol * this._sideDiscoardCardSize.width;
                    let topEdge = (totalHeight - this._sideDiscoardCardSize.height) / 2;

                    this._setLayoutContentSize(this.lefDiscardCardsLayout, new Size(totalWidth, totalHeight));
                    console.log("totalWidth (top): " + totalWidth + ", totalHeight: " + totalHeight + ", topEdge: " + topEdge); 

                    let index = 0;
                    let offsetY = topEdge;
                    let offsetX = this._sideDiscoardCardSize.width / 2;;

                    for(const discardCard of playerCards.discardCards) {
                        if(index >= this._discardedCardsPerLine) {
                            index = 0;
                            offsetX += this._sideDiscoardCardSize.width;
                            offsetY = topEdge;
                        }
                        const discardCardNode = instantiate(this.lrGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(discardCardNode, discardCard, CardType.VISIBLE, player.seat);
                        discardCardNode.parent = this.lefDiscardCardsLayout;
                        Utils.updatePosition(discardCardNode, {x: offsetX, y: offsetY})
                        offsetY -= (this._sideDiscoardCardSize.height + this._leftRightGangCardLayoutVGap)
                        index += 1;
                    }
                    
                } else {
                    this._setLayoutContentSize(this.lRightGangCard.node, new Size(handCardSize.width, totalHandCardHeight));
                    this._setLayoutContentSize(this.lRightGangCard.node, new Size(gangCardSize.width, totalGangCardHeight));
                    this._setLayoutContentSize(this.rightCardsLayout.node, new Size(totalLayoutWidth, totalGangCardHeight + totalHandCardHeight))
                
                    this.lRightHandCard.node.removeAllChildren();
                    this.lRightGangCard.node.removeAllChildren();
                    this.rightDiscardCardsLayout.removeAllChildren();

                    for(const handCard of playerCards.handCards) {
                        const rightHandCard = instantiate(this.rHandcardPrefab);
                        ImageLoader.refreshMahjongSprite(rightHandCard, handCard, CardType.HANDCARD, player.seat);
                        this.lRightHandCard.node.addChild(rightHandCard)
                    }

                    for(const gangCard of playerCards.gangCards) {
                        const rightGangCard = instantiate(this.lrGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(rightGangCard, gangCard, CardType.VISIBLE, player.seat);
                        this.lRightGangCard.node.addChild(rightGangCard);
                    }

                    for(const chicard of playerCards.chiCards) {
                        const chiCardNode = instantiate(this.lrGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(chiCardNode, chicard, CardType.VISIBLE, player.seat);
                        this.lRightGangCard.node.addChild(chiCardNode);
                    }
                    Utils.updatePosition(this.rightCardsLayout.node, {y: 0})

                    // 弃牌layout
                    let totalHeight = this._sideDiscoardCardSize.width * (this._discardedCardsPerLine - 1);
                    let totalCol = Math.ceil(playerCards.discardCards.length / this._discardedCardsPerLine) + (playerCards.discardCards.length % this._discardedCardsPerLine > 0 ? 1 : 0);
                    let totalWidth = totalCol * this._sideDiscoardCardSize.width;
                    let bottomEdge = -(totalHeight - this._sideDiscoardCardSize.height) / 2;

                    this._setLayoutContentSize(this.rightDiscardCardsLayout, new Size(totalWidth, totalHeight));
                    console.log("totalWidth (top): " + totalWidth + ", totalHeight: " + totalHeight + ", topEdge: " + bottomEdge); 

                    let index = 0;
                    let offsetY = bottomEdge;
                    let offsetX = -this._sideDiscoardCardSize.width / 2;;

                    for(const discardCard of playerCards.discardCards) {
                        if(index >= this._discardedCardsPerLine) {
                            index = 0;
                            offsetX -= this._sideDiscoardCardSize.width;
                            offsetY = bottomEdge;
                        }
                        const discardCardNode = instantiate(this.lrGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(discardCardNode, discardCard, CardType.VISIBLE, player.seat);
                        discardCardNode.parent = this.rightDiscardCardsLayout;
                        discardCardNode.setSiblingIndex(playerCards.discardCards.length - index);
                        Utils.updatePosition(discardCardNode, {x: offsetX, y: offsetY})
                        offsetY += this._sideDiscoardCardSize.height + this._leftRightGangCardLayoutVGap;
                        index += 1;
                    }
                }                
            } else {
                handCardSize = this._topBottomCardSize;
                gangCardSize = this._topBottomGangCardSize;

                const totalHandCardWidth = playerCards.handCards.length * handCardSize.width;
                const totalGangCardsWidth = (playerCards.gangCards.length + playerCards.chiCards.length) * gangCardSize.width;
                const totalLayoutHeight = Math.max(handCardSize.height, gangCardSize.height)

                if(player.seat === PlayerSeat.TOP) {
                    this._setLayoutContentSize(this.lTopHandCard.node, new Size(totalHandCardWidth, handCardSize.height));
                    this._setLayoutContentSize(this.lTopGangCard.node, new Size(totalGangCardsWidth, gangCardSize.height));
                    this._setLayoutContentSize(this.topCardsLayout.node, new Size(totalGangCardsWidth + totalHandCardWidth + this._topBottomCardsLayoutGap, totalLayoutHeight))

                    this.lTopHandCard.node.removeAllChildren()
                    this.lTopGangCard.node.removeAllChildren()
                    this.topDiscardCardsLayout.removeAllChildren();
                    
                    for(const handcard of playerCards.handCards) {
                        const handCardNode = instantiate(this.topHandCardPrefab);
                        ImageLoader.refreshMahjongSprite(handCardNode, handcard, CardType.HANDCARD, player.seat);
                        this.lTopHandCard.node.addChild(handCardNode);
                    }

                    for(const gangCard of playerCards.gangCards) {
                        const chiCardNode = instantiate(this.topGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(chiCardNode, gangCard, CardType.VISIBLE, player.seat);
                        this.lTopGangCard.node.addChild(chiCardNode);
                    }

                    for(const chiCard of playerCards.chiCards) {
                        const chiCardNode = instantiate(this.topGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(chiCardNode, chiCard, CardType.VISIBLE, player.seat);
                        this.lTopGangCard.node.addChild(chiCardNode);
                    }
                    Utils.updatePosition(this.topCardsLayout.node, {x: 0})
                    console.log("layout on top, totalWidth: " + totalGangCardsWidth + "," + totalHandCardWidth + "," + totalLayoutHeight)

                    // 弃牌layout
                    let totalWidth = this._topBottomDiscardCardSize.width * this._discardedCardsPerLine;
                    let totalRow = Math.ceil(playerCards.discardCards.length / this._discardedCardsPerLine) + (playerCards.discardCards.length % this._discardedCardsPerLine > 0 ? 1 : 0);
                    let totalHeight = totalRow * this._topBottomDiscardCardSize.height;
                    let rightEdge = (totalWidth - this._topBottomDiscardCardSize.width) / 2;

                    this._setLayoutContentSize(this.topDiscardCardsLayout, new Size(totalWidth, totalHeight));
                    console.log("totalWidth (top): " + totalWidth + ", totalHeight: " + totalHeight + ", rightEdge: " + rightEdge); 

                    let index = 0;
                    let offsetY = -this._topBottomDiscardCardSize.height / 2;
                    let offsetX = rightEdge;

                    for(const discardCard of playerCards.discardCards) {
                        if(index >= this._discardedCardsPerLine) {
                            index = 0;
                            offsetY -= this._topBottomDiscardCardSize.height;
                            offsetX = rightEdge;
                        }
                        const discardCardNode = instantiate(this.topGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(discardCardNode, discardCard, CardType.VISIBLE, player.seat);
                        discardCardNode.parent = this.topDiscardCardsLayout;
                        Utils.updatePosition(discardCardNode, {x: offsetX, y: offsetY})
                        offsetX -= this._topBottomDiscardCardSize.width
                        index += 1;
                    }
                } else {
                    this._setLayoutContentSize(this.lBottomHandCard.node, new Size(totalHandCardWidth, handCardSize.height));
                    this._setLayoutContentSize(this.lBottomGangCard.node, new Size(totalGangCardsWidth, gangCardSize.height));
                    this._setLayoutContentSize(this.bottomCardsLayout.node, new Size(totalGangCardsWidth + totalHandCardWidth + this._topBottomCardsLayoutGap, totalLayoutHeight))

                    this.lBottomHandCard.node.removeAllChildren()
                    this.lBottomGangCard.node.removeAllChildren()
                    this.bottomDiscardCardsLayout.removeAllChildren();
                    
                    for(const handcard of playerCards.handCards) {
                        const handCardNode = instantiate(this.topHandCardPrefab);
                        ImageLoader.refreshMahjongSprite(handCardNode, handcard, CardType.HANDCARD, player.seat);
                        this.lBottomHandCard.node.addChild(handCardNode);
                    }

                    for(const gangCard of playerCards.gangCards) {
                        const gangCardNode = instantiate(this.topGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(gangCardNode, gangCard, CardType.VISIBLE, player.seat);
                        this.lBottomGangCard.node.addChild(gangCardNode);
                    }

                    for(const chiCard of playerCards.chiCards) {
                        const chiCardNode = instantiate(this.topGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(chiCardNode, chiCard, CardType.VISIBLE, player.seat);
                        this.lBottomGangCard.node.addChild(chiCardNode);
                    }
                    Utils.updatePosition(this.bottomCardsLayout.node, {x: 0})
                    console.log("layout on bottom, totalWidth: " + totalGangCardsWidth + "," + totalHandCardWidth + "," + totalLayoutHeight)

                    // 弃牌layout
                    let totalWidth = this._topBottomDiscardCardSize.width * this._discardedCardsPerLine;
                    let totalRow = Math.ceil(playerCards.discardCards.length / this._discardedCardsPerLine) + (playerCards.discardCards.length % this._discardedCardsPerLine > 0 ? 1 : 0);
                    let totalHeight = totalRow * this._topBottomDiscardCardSize.height;
                    let leftEdge = -(totalWidth - this._topBottomDiscardCardSize.width) / 2;

                    this._setLayoutContentSize(this.bottomDiscardCardsLayout, new Size(totalWidth, totalHeight));
                    console.log("totalWidth: " + totalWidth + ", totalHeight: " + totalHeight + ", leftEdge: " + leftEdge); 

                    let index = 0;
                    let offsetY = 0;
                    let offsetX = leftEdge;

                    for(const discardCard of playerCards.discardCards) {
                        if(index >= this._discardedCardsPerLine) {
                            index = 0;
                            offsetY -= this._topBottomDiscardCardSize.height;
                            offsetX = leftEdge;
                        }
                        const discardCardNode = instantiate(this.bottomGangCardPrefab);
                        ImageLoader.refreshMahjongSprite(discardCardNode, discardCard, CardType.VISIBLE, player.seat);
                        discardCardNode.parent = this.bottomDiscardCardsLayout;
                        
                        Utils.updatePosition(discardCardNode, {x: offsetX, y: offsetY})
                        
                        offsetX += this._topBottomDiscardCardSize.width
                        index += 1;
                    }
                }
            }

        })
    }

    private layoutDiscardCards(allPlayers: PlayerInfo[]) {
        allPlayers.forEach(player => {
            console.log("player: " + player);
            const playerCards = this.gameLogic.getPlayerCards(player.id);
            let handCardSize = this._topBottomCardSize;
            let gangCardSize = this._topBottomGangCardSize;

        })
    }

}

