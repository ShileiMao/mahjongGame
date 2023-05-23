export class StringUtils {
  public static isEmpty(str: string | undefined | null) {
    if(str === undefined || str === null || str === '') {
      return true
    }
    return false
  }
}