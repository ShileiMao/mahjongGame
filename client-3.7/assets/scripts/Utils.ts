import { _decorator, Button, Component, EventHandler, Node, game, macro, math, Slider, SystemEvent, systemEvent, utils, Vec3, UITransform } from 'cc';
import { AppGlobal } from './components/AppGlobal';
const { ccclass } = _decorator;

@ccclass('Utils')
export class Utils extends Component {

    addClickEvent (node: any, target: any, component: any, handler: any) {
        console.log(component + ":" + handler);
        var eventHandler = new EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        var clickEvents = node.getComponent(Button).clickEvents;
        clickEvents.push(eventHandler);
    }

    addSlideEvent (node: any, target: any, component: any, handler: any) {
        var eventHandler = new EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        var slideEvents = node.getComponent(Slider).slideEvents;
        slideEvents.push(eventHandler);
    }

    addEscEvent (node: any) {
        systemEvent.on(SystemEvent.EventType.KEY_UP, (event) => {
            if(event.keyCode == macro.KEY.back){
                AppGlobal.vv().alert.show('提示','确定要退出游戏吗？',function(){
                    game.end();
                }, true);
            }
        }, node);
    }

    setRotation(node: Node, rotation: {x?: number, y?: number, z?: number}) {
        const oldRotation: math.Quat = node.rotation
        const newRotation = math.quat(rotation.x || oldRotation.x, rotation.y || oldRotation.y, rotation.z || oldRotation.z, oldRotation.w)
        node.setRotation(newRotation)
    }

    setLocation(node: Node, location: {x?: number, y?: number, z?: number}) {
        const oldPosition = node.position
        const newPosition = new Vec3(location.x || oldPosition.x, location.y || oldPosition.y, location.z || oldPosition.z);
        node.setPosition(newPosition)
    }

    setScale(node: Node, scale: {x?: number, y?: number, z?: number}) {
        const curScale = node.scale;
        const newScale = new Vec3(scale.x || curScale.x, scale.y || curScale.y, scale.z || curScale.z)
        node.setScale(newScale)
    }

    setSize(node: Node, size: {width?: number, height?: number}) {
        const transformComp = node.getComponent(UITransform)
        if(transformComp) {
            if(size.width) {
                transformComp.width = size.width 
            }
            if(size.height) {
                transformComp.height = size.height
            }
        }
    }

}
