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
        console.info("this is event message, delegate ...\n eventname: " + jsonObj[0]+ ", \ndata: " )
        console.log(jsonObj[1])

        const eventName = jsonObj[0];
        
        if(this.eventHandlers[eventName]) {

          this.eventHandlers[eventName](jsonObj[1] || "");
        }
      }
    } catch(error) {
      console.error("failed to parse raw message, this is an unkown event!\n" + error);
      console.error(error.stack)
    }
  }

  emit(event: string, data: any = '') {
    this.socket.send(JSON.stringify([event, data]));
  }
}