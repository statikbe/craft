export class Formatter {
  constructor() {}

  public static sprintf(string: string, parameters) {
    if ("object" === typeof parameters) {
      for (var i in parameters) string = this.sprintf(string, parameters[i]);
      return string;
    }
    return "string" === typeof string ? string.replace(/%s/i, parameters) : "";
  }

  public static parseTemplate(
    template: string,
    data: Array<any>,
    delimiter = "%%"
  ) {
    const regexSearch = new RegExp(
      delimiter + "([a-zA-z0-9.]+)" + delimiter,
      "gi"
    );
    const regexReplace = new RegExp(delimiter, "gi");
    const matches = template.match(regexSearch);
    if (matches) {
      matches.forEach((match) => {
        const path = match.replace(regexReplace, "");
        let value = data;
        path.split(".").forEach((param) => {
          if (value) {
            value = value[param];
          }
        });
        if (value) {
          template = template.replace(match, value.toString());
        }
      });
    }
    return template;
  }
}
