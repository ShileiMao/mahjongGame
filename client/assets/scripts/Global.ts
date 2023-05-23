import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('Global')
export class Global extends Component {
    public static isstarted = false;
    public static netinited = false;
    public static userguid = 0;
    public static nickname = '';
    public static money = 0;
    public static lv = 0;
    public static roomId = 0;
}


/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
// var Global = cc.Class({
//     extends: cc.Component,
//     statics: {
//         isstarted:false,
//         netinited:false,
//         userguid:0,
//         nickname:"",
//         money:0,
//         lv:0,
//         roomId:0,
//     },
// });
