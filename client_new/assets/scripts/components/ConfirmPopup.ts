import PopupBase from "./PopupBase";
import { _decorator, Node, Component, Label } from "cc";
const { ccclass, property } = _decorator;

/**
 * 确认弹窗（PopupBase 使用示例）
 */
@ccclass
export default class ConfirmPopup extends PopupBase<ConfirmPopupOptions> {

    @property(Label)
    private titleLabel: Label = null;

    @property(Label)
    private contentLabel: Label = null;

    @property(Node)
    private confirmBtn: Node = null;

    protected onLoad() {
        this.registerEvent();
    }

    protected onDestroy() {
        this.unregisterEvent();
    }

    private registerEvent() {
        this.confirmBtn.on(Node.EventType.TOUCH_END, this.onConfirmBtnClick, this);
    }

    private unregisterEvent() {
        this.confirmBtn.targetOff(this);
    }

    protected init() {

    }

    protected updateDisplay(options: ConfirmPopupOptions): void {
        this.titleLabel.string = options.title;
        this.contentLabel.string = options.content;
    }

    protected onConfirmBtnClick() {
        this.options.confirmCallback && this.options.confirmCallback();
        this.hide();
    }

}

/** 确认弹窗选项 */
export interface ConfirmPopupOptions {
    title: string;
    content: string;
    confirmCallback: Function;
}
