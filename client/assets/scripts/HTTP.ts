import { _decorator, Component, System, resources, sys } from 'cc';
const { ccclass } = _decorator;

let URL = "http://localhost:9000";
@ccclass('HTTP')
export class HTTP extends Component {

    public sessionId = 0;
    public userId = 0;
    public master_url = URL;
    public url = URL;
    public sendRequest(path: any, data: any, handler: (ret: any) => void, extraUrl: string = null) {
        var xhr = new XMLHttpRequest();
        xhr.timeout = 5000;
        var str = "?";
        for(var k in data){
            if(str != "?"){
                str += "&";
            }
            str += k + "=" + data[k];
        }
        if(extraUrl == null){
            extraUrl = this.url;
        }
        var requestURL = extraUrl + path + encodeURI(str);
        console.log("RequestURL:" + requestURL);
        xhr.open("GET",requestURL, true);
        if (sys.isNative){
            // xhr.setRequestHeader("Accept-Encoding","gzip,deflate", "text/html;charset=UTF-8");
            xhr.setRequestHeader("Accept-Encoding", "text/html;charset=UTF-8");
        }
        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)){
                console.log("url: " + path);
                console.log("http res("+ xhr.responseText.length + "):" + xhr.responseText);
                try {
                    var ret = JSON.parse(xhr.responseText);
                    console.log("response json: " + ret)
                    
                    if(handler !== null){
                        handler(ret);
                    }                        /* code */
                } catch (e) {
                    console.log("err:" + e);
                }
                finally{
                    console.log("TODO: // what we should do here?")
                    console.log("#### finally called.")
                }
            }
        };
        
        xhr.send();
        return xhr;
    }

    public setUrl(url: string) {
        this.url = url;
    }
}

