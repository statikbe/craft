export class Formatter {
  constructor() {}

  public static sprintf(string: string, parameters) {
    if ("object" === typeof parameters) {
      for (var i in parameters) string = this.sprintf(string, parameters[i]);
      return string;
    }
    return "string" === typeof string ? string.replace(/%s/i, parameters) : "";
  }
}
