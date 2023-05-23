import { Component ,_decorator, game, Game } from "cc";

const { ccclass, property } = _decorator;


export class WebSocketWrapper {
  eventHandlers: {[name: string]: (message: any) => void} = {};
  socket: WebSocket

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.socket.onmessage = ((message) => {
      this.processEvent(message.data);
    })
  }

  addEventHandler(event: string, callback: (data: any) => void) {
    if(this.eventHandlers[event]) {
      console.log(" the event handler already exists: " + event);
      return
    }

    this.eventHandlers[event] = callback;
  }

  processEvent(rawMessage: string) {
    console.log("process raw message: " + rawMessage);
    try {
      const jsonObj = JSON.parse(rawMessage);
      if(Array.isArray(jsonObj) && jsonObj.length > 0) {
        const eventName = jsonObj[0];
        if(this.eventHandlers[eventName]) {
          this.eventHandlers[eventName](jsonObj[1] || "");
        }
      }
    } catch(error) {
      console.error("failed to parse raw message, this is an unkown event!");
    }
  }

  emit(event: string, data: any) {
    this.socket.send(JSON.stringify([event, data]));
  }
}

// @ccclass("TestSocket")
// export class TestSocket extends Component {
//   private _socket: WebSocket;
//   private _socketWrapper: WebSocketWrapper

//   protected start(): void {
//     console.log("socket start!")
//     this._socket = new WebSocket("ws://localhost:10000")
//     this._socketWrapper = new WebSocketWrapper(this._socket);

//     this._socket.onopen = (event: Event) => {
//       console.log("on socket open!: " + event)

//       this._socketWrapper.emit("login", {
//         username: "hello name",
//         token: "45d9370c1f571427cbf321cb592ac253",
//         time: "2023-05-17",
//         sign: "c1e3b66a1dbc4e2d63226fc92e9e2318",
//         roomid: "123456",
//         userid: "123435"
//       })
//     }

//     this._socket.onclose = (event) => {
//       console.log("socket close!")
//     }
//     this._socket.onerror = (event) => {
//       console.log("on socket error!")
//     }

//     this._socketWrapper.addEventHandler("login_result", (data) => {
//       console.log("login result: " + data);
//     })
//   }

//   protected update(dt: number): void {
//     // this._socket.send("hello server！")
//   }

//   public send(event: MouseEvent, customData: string) {
    
    
//   }
// }