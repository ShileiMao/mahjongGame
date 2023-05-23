import { _decorator, Component, error } from "cc";
import { StringParams } from "../core/Config";
const {ccclass } = _decorator;


@ccclass("HttpUtils") 
export class HttpUtils extends Component {
  public async get(url: string, params: object) {
    const getUrl = this.buildUrlWithQuery(url, params);
    console.log("trying to fetch url: " + getUrl);
    const response = await fetch(getUrl);
    return response;
  }

  private buildQueryParams(params: object): string {
    let query = "";
    let prefix = "?"

    // if(params instanceof Map<string, string>) {
    //   Object.keys(params).forEach(key => {
    //     console.log("fucky ou!")
    //   })
    //   // params.forEach((value: string, key: string) => {
    //   //   query += `${prefix}${key}=${value}`
    //   //   prefix = "&";
    //   // });
    //   // return query;
    // }

    const objectParam = params as StringParams;
    if(objectParam === null) {
      return "";
    }

    Object.keys(objectParam).forEach(key => {
      query += `${prefix}${key}=${objectParam[key]}`
      prefix = "&";
    });
    return query;
  }

  private buildUrlWithQuery(url: string, params: object) : string {
  
    if(params === null) {
      return url;
    }
    
    const query = this.buildQueryParams(params);

    return `${url}${query}`;
  }
}