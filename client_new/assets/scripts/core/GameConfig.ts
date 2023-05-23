export enum RoomType {  
  XLCH = "xlch", // 血流成河
  XZDD = "xzdd", // 血战到底
}

export class RoomConfig {
  public type: RoomType = RoomType.XLCH;
	public difen: number = 1; // 底分（每局起始分数）int
	public zimo: boolean = false // 自摸 int
  public jiangdui: boolean = false
	public huansanzhang: boolean = false; // 换三张 （血流成河打法）
	public zuidafanshu: number = 4; // 最大蕃数
	public jushuxuanze: number = 4;
	public dianganghua: number = 0;
	public menqing: boolean = false; // 门清 （自摸)
	public tiandihu: boolean = false; // 天地胡

  public setDefault() {
    this.type = RoomType.XLCH;
  }

}