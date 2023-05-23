import { CardCode, PlayerSeat, CardType } from "../core/GameLogic";

export class MahjongResourceMapper {
  public static getResourceName(cardCode: CardCode, cardType: CardType, seat: PlayerSeat){
    switch(seat) {
      case PlayerSeat.TOP:
        if(cardType === CardType.HANDCARD) {
          return `image/GameLayer/Mahjong/hand_top/spriteFrame`
        }
        if(cardType === CardType.VISIBLE) {
          return `image/GameLayer/Mahjong/2/mingmah_${cardCode}/spriteFrame`
        }
        return `image/GameLayer/Mahjong/2/mingmah_00/spriteFrame`

      case PlayerSeat.BOTTOM:
        if(cardType === CardType.HANDCARD) {
          return `image/GameLayer/Mahjong/2/handmah_${cardCode}/spriteFrame`
        }

        if(cardType === CardType.VISIBLE) {
          return `image/GameLayer/Mahjong/2/mingmah_${cardCode}/spriteFrame`
        }
        return `image/GameLayer/Mahjong/2/handmah_${cardCode}/spriteFrame`

      case PlayerSeat.LEFT:
        if(cardType === CardType.HANDCARD) {
          return `image/GameLayer/Mahjong/hand_left/spriteFrame`
        }

        if(cardType === CardType.VISIBLE) {
          return `image/GameLayer/Mahjong/3/mingmah_${cardCode}/spriteFrame`
        }
        return `image/GameLayer/Mahjong/3/mingmah_00/spriteFrame`

      case PlayerSeat.RIGHT:
        if(cardType === CardType.HANDCARD) {
          return `image/GameLayer/Mahjong/hand_right/spriteFrame`
        }

        if(cardType === CardType.VISIBLE) {
          return `image/GameLayer/Mahjong/1/mingmah_${cardCode}/spriteFrame`
        }
        return `image/GameLayer/Mahjong/1/mingmah_00/spriteFrame`
    }
  }
}