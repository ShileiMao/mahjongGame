import { _decorator, Button, Component, EditBox, EventHandler, Node, Vec3 } from "cc";
const {ccclass} = _decorator;

@ccclass("Utils")
export class Utils extends Component {
  addClickEvent (button: Button, target: Node, component: string, handler: string, customData: string) {
    console.log(component + ":" + handler);
    var eventHandler = new EventHandler();
    eventHandler.target = target;
    eventHandler.component = component;
    eventHandler.handler = handler;
    eventHandler.customEventData = customData;
    button.clickEvents.push(eventHandler);
  }

  addTextChangedEvent(textBox: EditBox, target: Node, component: string, handler: string, customData: string) {
    const eventHandler = this.createEventHandler(target, component, handler, customData);
    textBox.textChanged.push(eventHandler);
  }

  createEventHandler(target: Node, component: string, handler: string, customData: string) {
    const myHandler = new EventHandler();
    myHandler.target = target; // 这个 node 节点是你的事件处理代码组件所属的节点
    myHandler.component = component;
    myHandler.handler = handler;
    myHandler.customEventData = customData;
    
    return myHandler;
  }
  
  static updatePosition(node: Node, position: {x?: number, y?: number, z?: number}) {
    const newPosition: Vec3 = {... node.position, ...position}
    node.setPosition(newPosition);
  }
  
  static findComponent<T extends Component>(node: Node, componentType: new (...args: any[]) => T): T | null {
    const comp = node.getComponent(componentType);
    if(comp) {
      return comp
    }

    
    for(const child of node.children) {
      const comp = this.findComponent(child, componentType)
      if(comp) {
        return comp;
      }
    }
  }
}