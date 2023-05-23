import { _decorator, assetManager, Component, error, Node, resources, Sprite, SpriteFrame, sys, Texture2D } from 'cc';
import { CardCode, CardType, PlayerSeat } from '../core/GameLogic';
import { MahjongResourceMapper } from '../views/MahjongResourceMapper';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;


@ccclass('ImageLoader')
export class ImageLoader extends Component {
  static loadSpritFrame(path: string, callback: (error: Error, spriteFrame: SpriteFrame) => void) {
    resources.load(path, SpriteFrame, callback)
  }

  static refreshMahjongSprite(mahjongNode: Node, cardCode: CardCode, cardType: CardType, seat: PlayerSeat) {
    const path = MahjongResourceMapper.getResourceName(cardCode, cardType, seat);
    this.loadSpritFrame(path, (error, data) => {
      if(error) {
        console.log("failed to load mahjong: " + path)
        return;
      }

      const spriteNode = Utils.findComponent(mahjongNode, Sprite);
      if(!spriteNode) {
        console.log("Failed to find sprite for mahjong: " + cardCode + ", cardType: " + cardType + ", " + "seat: " + seat);
        return
      }
      spriteNode.spriteFrame = data;
    })
  }
}