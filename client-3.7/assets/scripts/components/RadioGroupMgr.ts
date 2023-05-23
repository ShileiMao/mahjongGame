import { _decorator, Component } from 'cc';
import { RadioButton } from './RadioButton';
const { ccclass } = _decorator;

@ccclass('RadioGroupMgr')
export class RadioGroupMgr extends Component {
    private _groups: {
        [key: number]: RadioButton[]
    }

    init () {
        this._groups = {};
    }

    add (radioButton: RadioButton) {
        var groupId = radioButton.groupId; 
        var buttons = this._groups[groupId];
        if(buttons == null){
           buttons = [];
           this._groups[groupId] = buttons; 
        }
        buttons.push(radioButton);
    }

    del (radioButton: RadioButton) {
        var groupId = radioButton.groupId;
        var buttons = this._groups[groupId];
        if(buttons == null){
           return; 
        }
        var idx = buttons.indexOf(radioButton);
        if(idx != -1){
           buttons.splice(idx,1);            
        }
        if(buttons.length == 0){
           delete this._groups[groupId]   
        }
    }

    check (radioButton: any) {
        var groupId = radioButton.groupId;
        var buttons = this._groups[groupId];
        if(buttons == null){
           return; 
        }
        for(var i = 0; i < buttons.length; ++i){
           var btn = buttons[i];
           if(btn == radioButton){
               btn.check(true);
           }else{
               btn.check(false);
           }
        }        
    }

}
