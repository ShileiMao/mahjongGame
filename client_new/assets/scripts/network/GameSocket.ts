import { Component ,_decorator, game, Game } from "cc";
import { WebSocketWrapper } from "./SocketWrapper";
const { ccclass, property } = _decorator;

@ccclass("GameSocket")
export class GameSocket {
  public ip: string = '';
  public  sio: WebSocket | null = null;
  public isPinging = false;
  public fnDisconnect: Function | null = null;
  public handlers = new Map<string, (data: any) => void>();

  private socketWrapper: WebSocketWrapper;

  lastRecieveTime: number = Date.now();
  lastSendTime: number = Date.now();
  delayMS: number = 0

  public addHandler(event: string, fn: Function) {
      if(this.handlers.get(event)){
          console.log("event:" + event + "' handler has been registered.");
          return;
      }
      var handler = function(data: any){
          if(event != "disconnect" && typeof(data) == "string"){
              data = JSON.parse(data);
          }
          fn(data);
      };

      this.handlers.set(event, handler); 
      if(this.sio){
          console.log("register:function " + event);

          interface WebSocketEventMap {
              "close": CloseEvent;
              "error": Event;
              "message": MessageEvent;
              "open": Event;
          }

          // TODO: check this
          this.sio.addEventListener(event, handler);
      }
  }    
  
  public connect(fnConnect: (event: Event) => void, fnError: (event: Event) => void) {
      var self = this;
      var opts = {
          'reconnection':false,
          'force new connection': true,
          'transports':['websocket', 'polling']
      }

      this.sio = new WebSocket(this.ip)
      this.socketWrapper = new WebSocketWrapper(this.sio);

      this.sio.onopen = (event) => {
          console.log("on socket open")
          fnConnect(event)
      }
      
      this.sio.onclose = (event) => {
          console.log("disconnect");
      }

      this.sio.onerror = (event) => {
          console.log('connect_failed');
          fnError(event);
      }

      for(var key in this.handlers){
          var value = this.handlers.get(key);
          if(typeof(value) == "function"){
              if(key == 'disconnect'){
                  this.fnDisconnect = value;
              }
              else{
                  console.log("register:function " + key);
                  this.socketWrapper.addEventHandler(key, value)
              }
          }
      }
      this.startHearbeat();
  }  

  startHearbeat(){
      this.socketWrapper.addEventHandler('game_pong', (event) => {
      // this.sio.on('game_pong',function(){
          console.log('game_pong');

          self.lastRecieveTime = Date.now();
          self.delayMS = self.lastRecieveTime - self.lastSendTime;
          console.log(self.delayMS);
      });

      this.lastRecieveTime = Date.now();
      var self = this;
      console.log(1);
      if(!self.isPinging){
          self.isPinging = true;
          game.on(Game.EVENT_HIDE,function(){
              self.ping();
          });
          setInterval(function(){
              if(self.sio){
                  self.ping();                
              }
          }.bind(this),5000);
          setInterval(function(){
              if(self.sio){
                  if(Date.now() - self.lastRecieveTime > 10000){
                      self.close();
                  }         
              }
          }.bind(this),500);
      }   
  }  

  send(event: string, data: any = null) {
    if(this.sio.readyState !== WebSocket.OPEN) {
        console.error("socket is not open");
        return;
    }
    
    this.socketWrapper.emit(event, data);   
  } 

  ping() {
    if(this.sio){
        this.lastSendTime = Date.now();
        this.send('game_ping');
    }
  }   
  close(){
      console.log('close');
      this.delayMS = null;
      if(this.sio && this.sio.readyState !== WebSocket.CLOSED){
          // this.sio.connected = false;
          this.sio.close()
      }
      this.sio = null;
      this.socketWrapper = null;

      if(this.fnDisconnect){
          this.fnDisconnect();
          this.fnDisconnect = null;
      }
  }    
  test(fnResult: Function){
      // var xhr = null;
      // var fn = function(ret){
      //     fnResult(ret.isonline);
      //     xhr = null;
      // }
      // var arr = this.ip.split(':');
      // var data = {
      //     account: AppGlobal.vv.userMgr.account,
      //     sign: AppGlobal.vv.userMgr.sign,
      //     ip:arr[0],
      //     port:arr[1],
      // }
      // xhr = AppGlobal.vv.http.sendRequest("/is_server_online",data,fn);
      // setTimeout(function(){
      //     if(xhr){
      //         xhr.abort();
      //         fnResult(false);                    
      //     }
      // },1500);
      // var opts = {
      //     'reconnection':false,
      //     'force new connection': true,
      //     'transports':['websocket', 'polling']
      // }
      // var self = this;
      // this.testsio = window.io.connect(this.ip,opts);
      // this.testsio.on('connect',function(){
      //     console.log('connect');
      //     self.testsio.close();
      //     self.testsio = null;
      //     fnResult(true);
      // });
      // this.testsio.on('connect_error',function(){
      //     console.log('connect_failed');
      //     self.testsio = null;
      //     fnResult(false);
      // });
  }

  emit(event: string, data: any) {
    console.log("emit event: " + event + ", data: " + data)
    
    this.send(JSON.stringify({event, data}));
  }
}