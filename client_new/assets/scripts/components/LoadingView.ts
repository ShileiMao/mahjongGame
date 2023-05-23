import { _decorator, Component, Node, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoadingView')
export class LoadingView extends Component {
    @property(Animation)
    public progressAnimation: Animation = null;

    start() {
        // this.progressAnimation.play('rotation')
        this.progressAnimation.playOnLoad = true;
    }

    update(deltaTime: number) {
        
    }
}

