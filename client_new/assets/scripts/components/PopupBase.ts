import { _decorator, BlockInputEvents, Component, Node, tween, Vec3 } from "cc";

const { ccclass, property } = _decorator;

/**
 * 弹窗基类
 * @see PopupBase.ts https://gitee.com/ifaswind/eazax-ccc/blob/master/components/popups/PopupBase.ts
 * @see PopupManager.ts https://gitee.com/ifaswind/eazax-ccc/blob/master/core/PopupManager.ts
 * @version 20210409
 */
@ccclass
export default class PopupBase<Options = any> extends Component {

    @property({ type: Node, tooltip: '背景遮罩' })
    public background: Node = null;

    @property({ type: Node, tooltip: '弹窗主体' })
    public main: Node = null;

    /** 展示/隐藏动画的时长 */
    public animDuration: number = 0.3;

    /** 用于拦截点击的节点 */
    protected blocker: Node = null;

    /** 弹窗选项 */
    protected options: Options = null;

    /**
     * 展示弹窗
     * @param options 弹窗选项
     * @param duration 动画时长
     */
    public show(options?: Options, duration: number = this.animDuration) {
        return new Promise<void>(res => {
            // 储存选项
            this.options = options;
            // 初始化节点
            const background = this.background,
                main = this.main;
            this.node.active = true;
            background.active = true;
            // background.opacity = 0;
            main.active = true;
            main.setScale(new Vec3(0.5, 0.5, 0.5));
            // main.scale = 0.5;
            // main.opacity = 0;
            // 初始化
            this.init(this.options);
            // 更新样式
            this.updateDisplay(this.options);
            // 播放背景遮罩动画
            tween(background)
                .to(duration * 0.8, { })
                .start();
            // 播放弹窗主体动画
            tween(main)
                .to(duration, { scale: new Vec3(1)}, { easing: 'backOut' })
                .call(() => {
                    // 弹窗已完全展示
                    this.onShow && this.onShow();
                    // Done
                    res();
                })
                .start();
        });
    }

    /**
     * 隐藏弹窗
     * @param suspended 是否被挂起
     * @param duration 动画时长
     */
    public hide(suspended: boolean = false, duration: number = this.animDuration) {
        return new Promise<void>(res => {
            const node = this.node;
            // 动画时长不为 0 时拦截点击事件（避免误操作）
            if (duration !== 0) {
                let blocker = this.blocker;
                if (!blocker) {
                    blocker = this.blocker = new Node('blocker');
                    blocker.addComponent(BlockInputEvents);
                    blocker.setParent(node);
                    // blocker.setContentSize(node.getContentSize());
                }
                blocker.active = true;
            }
            // 播放背景遮罩动画
            tween(this.background)
                .delay(duration * 0.2)
                .to(duration * 0.8, {  })
                .start();
            // 播放弹窗主体动画
            tween(this.main)
                .to(duration, { scale: new Vec3(0.5)}, { easing: 'backIn' })
                .call(() => {
                    // 关闭拦截
                    this.blocker && (this.blocker.active = false);
                    // 关闭节点
                    node.active = false;
                    // 弹窗已完全隐藏（动画完毕）
                    this.onHide && this.onHide(suspended);
                    // Done
                    res();
                    // 弹窗完成回调
                    this.finishCallback && this.finishCallback(suspended);
                })
                .start();
        });
    }

    /**
     * 初始化（派生类请重写此函数以实现自定义逻辑）
     */
    protected init(options: Options) { }

    /**
     * 更新样式（派生类请重写此函数以实现自定义样式）
     * @param options 弹窗选项
     */
    protected updateDisplay(options: Options) { }

    /**
     * 弹窗已完全展示（派生类请重写此函数以实现自定义逻辑）
     */
    protected onShow() { }

    /**
     * 弹窗已完全隐藏（派生类请重写此函数以实现自定义逻辑）
     * @param suspended 是否被挂起
     */
    protected onHide(suspended: boolean) { }

    /**
     * 弹窗流程结束回调（注意：该回调为 PopupManager 专用，重写 hide 函数时记得调用该回调）
     */
    protected finishCallback: (suspended: boolean) => void = null;

    /**
     * 设置弹窗完成回调（该回调为 PopupManager 专用）
     * @param callback 回调
     */
    public setFinishCallback(callback: (suspended: boolean) => void) {
        this.finishCallback = callback;
    }

}
