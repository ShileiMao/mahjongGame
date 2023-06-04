import { _decorator, Canvas, Component, EditBox, sys } from 'cc';
import { AppGlobal } from './AppGlobal';
const { ccclass, property } = _decorator;

@ccclass('CreateRole')
export class CreateRole extends Component {
    @property
    public inputName:EditBox | null = null;

    onRandomBtnClicked () {
        var names = [
           "上官",
           "欧阳",
           "东方",
           "端木",
           "独孤",
           "司马",
           "南宫",
           "夏侯",
           "诸葛",
           "皇甫",
           "长孙",
           "宇文",
           "轩辕",
           "东郭",
           "子车",
           "东阳",
           "子言",
        ];
        var names2 = [
           "雀圣",
           "赌侠",
           "赌圣",
           "稳赢",
           "不输",
           "好运",
           "自摸",
           "有钱",
           "土豪",
        ];
        var idx = Math.floor(Math.random() * (names.length - 1));
        var idx2 = Math.floor(Math.random() * (names2.length - 1));
        this.inputName.string = names[idx] + names2[idx2];
    }

    onLoad () {
        if(!sys.isNative && sys.isMobile) {
            var cvs = this.node.getComponent(Canvas);
            // cvs.fitHeight = true;
            // cvs.fitWidth = true;
        }
        
        this.onRandomBtnClicked();
    }

    onBtnConfirmClicked () {
        console.log("confirm clicked")
        var name = this.inputName.string;
        if(name == ""){
           console.log("invalid name.");
           return;
        }
        console.log(name);
        AppGlobal.vv().userMgr.create(name);
    }

}