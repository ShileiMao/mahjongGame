import { _decorator, Button, Component, EventHandler, Node, game, macro, math, Slider, utils, Vec3, UITransform, Input, input, Quat } from 'cc';
import { AppGlobal } from './components/AppGlobal';
const { ccclass } = _decorator;

@ccclass('Utils')
export class Utils extends Component {

    addClickEvent (node: Node, target: Node, component: string, handler: string) {
        console.log(component + ":" + handler);
        var eventHandler = new EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        node.getComponent(Button).clickEvents.push(eventHandler);
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
        input.on(Input.EventType.KEY_UP, (event) => {
            if(event.keyCode == macro.KEY.back){
                AppGlobal.vv().alert.show('提示','确定要退出游戏吗？',function(){
                    game.end();
                }, true);
            }
        }, node)

        // systemEvent.on(SystemEvent.EventType.KEY_UP, (event) => {
        //     if(event.keyCode == macro.KEY.back){
        //         AppGlobal.vv().alert.show('提示','确定要退出游戏吗？',function(){
        //             game.end();
        //         }, true);
        //     }
        // }, node);
    }

    constructVectValue(newVal: {x?: number, y?: number, z?: number }, defaultValue: {x?: number, y?: number, z?: number}) {
        const newX = (newVal.x !== undefined && newVal.x !== null) ? newVal.x : defaultValue.x
        const newY = (newVal.y !== undefined && newVal.y !== null) ? newVal.y : defaultValue.y
        const newZ = (newVal.z !== undefined && newVal.z !== null) ? newVal.z : defaultValue.z

        return {
            x: newX,
            y: newY,
            z: newZ
        }
    }

    setRotation(node: Node, rotation: {x?: number, y?: number, z?: number}) {
        const oldRotation: math.Quat = node.rotation
        const newValues = this.constructVectValue(rotation, oldRotation)
        const newRotation = new Quat(newValues.x, newValues.y, newValues.z);

        node.setRotation(newRotation)
    }

    setLocation(node: Node, location: {x?: number, y?: number, z?: number}) {
        const oldPosition = node.position
        const newValues = this.constructVectValue(location, oldPosition);

        const newPosition = new Vec3(newValues.x, newValues.y, newValues.z);
        node.setPosition(newPosition)
    }

    setScale(node: Node, scale: {x?: number, y?: number, z?: number}) {
        const curScale = node.scale;
        const newValues = this.constructVectValue(scale, curScale);

        const newScale = new Vec3(newValues.x, newValues.y, newValues.z)
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
