import { _decorator, Component, sys, game, Game, utils, AudioSource, Node, director, AudioClip, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioMgr')
export class AudioMgr extends Component {
    @property
    public bgmVolume = 1;
    @property
    public sfxVolume = 1;
    @property
    public bgmAudioID = -1;

    private _audioSource: AudioSource;

    constructor() {
        super();
    }
    
    init () {

        //@en create a node as audioMgr
        //@zh 创建一个节点作为 audioMgr
        let audioMgr = new Node();
        audioMgr.name = '__audioMgr__';

        //@en add to the scene.
        //@zh 添加节点到场景
        // director.getScene().addChild(audioMgr);

        //@en make it as a persistent node, so it won't be destroied when scene change.
        //@zh 标记为常驻节点，这样场景切换的时候就不会被销毁了
        // director.addPersistRootNode(audioMgr);

        //@en add AudioSource componrnt to play audios.
        //@zh 添加 AudioSource 组件，用于播放音频。
        // this._audioSource = audioMgr.addComponent(AudioSource);


        // var t = sys.localStorage.getItem("bgmVolume");
        // if(t != null){
        //    this.bgmVolume = parseFloat(t);    
        // }
        // var t = sys.localStorage.getItem("sfxVolume");
        // if(t != null){
        //    this.sfxVolume = parseFloat(t);    
        // }

        // game.on(Game.EVENT_HIDE, function () {
        //    console.log("cc.audioEngine.pauseAll");
           
        // //    audioEngine.pauseAll();
        // });
        // game.on(Game.EVENT_SHOW, function () {
        //    console.log("cc.audioEngine.resumeAll");
        // //    cc.audioEngine.resumeAll();
        // });
    }

    getUrl (url: any) {
        // return cc.url.raw("resources/sounds/" + url);
        return "sounds/" + url;
    }

    playBGM (url: any) {
        var audioUrl = this.getUrl(url);
        console.log(audioUrl);
        if(this.bgmAudioID >= 0){
        //    audioEngine.stop(this.bgmAudioID);
        }
        this.play(audioUrl)
        // this.bgmAudioID = cc.audioEngine.play(audioUrl,true,this.bgmVolume);
    }


    /**
     * @en
     * play short audio, such as strikes,explosions
     * @zh
     * 播放短音频,比如 打击音效，爆炸音效等
     * @param sound clip or url for the audio
     * @param volume 
     */
    playOneShot(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._audioSource.playOneShot(sound, volume);
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.playOneShot(clip, volume);
                }
            });
        }
    }

    /**
     * @en
     * play long audio, such as the bg music
     * @zh
     * 播放长音频，比如 背景音乐
     * @param sound clip or url for the sound
     * @param volume 
     */
    play(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._audioSource.clip = sound;
            this._audioSource.play();
            this._audioSource.volume = volume;
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.clip = clip;
                    this._audioSource.play();
                    this._audioSource.volume = volume;
                }
            });
        }
    }

     /**
     * stop the audio play
     */
     stop() {
        this._audioSource.stop();
    }

    /**
     * pause the audio play
     */
    pause() {
        this._audioSource.pause();
    }

    /**
     * resume the audio play
     */
    resume(){
        this._audioSource.play();
    }

    
    playSFX (url: string) {
        var audioUrl = this.getUrl(url);
        if(this.sfxVolume > 0){
        //    var audioId = cc.audioEngine.play(audioUrl,false,this.sfxVolume);    
            this.playOneShot(audioUrl, this.sfxVolume)
        }
    }

    setSFXVolume (v: any) {
        if(this.sfxVolume != v){
           sys.localStorage.setItem("sfxVolume",v);
           this.sfxVolume = v;
        }
    }

    setBGMVolume (v: number, force: boolean = false) {
        if(this.bgmAudioID >= 0){
           if(v > 0){
            this.resume();
           }
           else{
            this.pause();
           }
        }
        if(this.bgmVolume != v || force){
           sys.localStorage.setItem("bgmVolume",v);
           this.bgmVolume = v;
            this._audioSource.volume = v
        }
    }

    pauseAll () {
        this.pause()
    }

    resumeAll () {
        this.resume()
    }

}