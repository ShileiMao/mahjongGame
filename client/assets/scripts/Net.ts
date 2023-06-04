import { _decorator, Component, sys, utils, game, Game} from 'cc';
import { WebSocketWrapper } from './SocketWrapper';
import { StringUtils } from './utils/StringUtils';
import { AppGlobal } from './components/AppGlobal';
const { ccclass } = _decorator;

@ccclass('Net')
export class Net extends Component {
    public ip: string = '';
    public  sio: WebSocket | null = null;
    public testSocket: WebSocket
    public isPinging = false;
    public fnDisconnect: Function | null = null;
    public handlers = new Map<string, (data: any) => void>();
  
    private socketWrapper: WebSocketWrapper;
  
    lastRecieveTime: number = Date.now();
    lastSendTime: number = Date.now();
    delayMS: number = 0
  
    public addHandler(event: string, fn: Function) {
        console.info("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
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
            this.socketWrapper.addEventHandler(event, handler);
        }

        console.log("############# handlers: " + this.handlers.keys)
    }    
    
    public connect(fnConnect: (event: Event) => void, fnError: (event: Event) => void) {
        console.log("%%%%%%%%%%%%%%% handlers: " + this.handlers.keys)
        var self = this;
        var opts = {
            'reconnection':false,
            'force new connection': true,
            'transports':['websocket', 'polling']
        }
  
        if(StringUtils.isEmpty(this.ip)) {
            console.error("The server IP is undefined, refuse to connect!");
            fnError(new ErrorEvent("custom"));
            return
        }
        if(!this.ip.startsWith("ws://")) {
            this.ip = `ws://${this.ip}`
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
  
        for(const [key, value] of this.handlers){
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
        var xhr = null;
        var fn = function(ret){
            fnResult(ret.isonline);
            xhr = null;
        }
        var arr = this.ip.split(':');
        var data = {
            account: AppGlobal.vv().userMgr.account,
            sign: AppGlobal.vv().userMgr.sign,
            ip:arr[0],
            port:arr[1],
        }
        xhr = AppGlobal.vv().http.sendRequest("/is_server_online",data,fn);
        setTimeout(function(){
            if(xhr){
                xhr.abort();
                fnResult(false);                    
            }
        },1500);
        var opts = {
            'reconnection':false,
            'force new connection': true,
            'transports':['websocket', 'polling']
        }
        var self = this;
        this.testSocket = new WebSocket(this.ip)
        this.testSocket.onopen =  ((event) => {
            console.log('connect');
            this.testSocket.close()
            this.testSocket = null;
            fnResult(true)
        })

        this.testSocket.onerror = (event) => {
            console.log("connect_failed")
            this.testSocket = null;
            fnResult(false);
        }
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