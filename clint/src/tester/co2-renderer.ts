import colors from "colors";
import * as fs from "fs";
import mustache from "mustache";
import open, { apps } from "open";
import { Helper } from "../libs/helpers";
import { RefreshServer } from "./refresh-server";
import { OutputTypeCO2 } from "./types";
import bytes from "bytes";
import * as excel from "node-excel-export";

export class CO2Renderer {
  private outputCO2: OutputTypeCO2[] = [];
  constructor(outputHTML) {
    this.outputCO2 = outputHTML;
  }

  public renderCO2OutputConsole() {
    let output = "";
    this.outputCO2.forEach((outputType: OutputTypeCO2) => {
      output += colors.underline.cyan(
        `${outputType.url} - ${outputType.CO2Data.co2.toPrecision(3)} g CO² (${bytes(
          outputType.CO2Data.totalBytes
        )}) ${this.getRating(outputType.CO2Data.co2)}\n`
      );
    });
    if (output.length > 0) {
      process.stdout.write(output);
      process.exit();
    }
  }

  public renderCO2OutputHTML(url: string, snippet: boolean = false) {
    const now = new Date();
    const mainUrl = new URL(url);
    let fileName = "";
    let path = "";
    let body = "";
    const manifest = Helper.getFrontendManifest();
    this.outputCO2.map((output) => {
      output.id = output.url.replace(/[^a-zA-Z0-9]/g, "");
      output.size = bytes(output.CO2Data.totalBytes);
      output.CO2Data.co2Formatted = output.CO2Data.co2.toPrecision(3);
      output.CO2Data.rating = this.getRating(output.CO2Data.co2);
    });

    fileName = `${now.getTime()}.html`;
    path = `./public/tmp/${fileName}`;
    const tmpDir = "./public/tmp/";
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    Helper.clearDirectory("./public/tmp");

    const template = fs.readFileSync("./templates/co2Tester.html", "utf8");
    body = mustache.render(template, {
      manifest: manifest,
      mainUrl: mainUrl.origin,
      isGreen: this.outputCO2[0]?.CO2Data.isGreen,
      testedUrls: this.outputCO2.map((o) => ({
        ...o,
        color: this.getRatingColor(o.CO2Data.rating),
      })),
    });

    if (!snippet) {
      fs.writeFile(path, body, (err: any) => {
        if (err) throw err;
        open.default(`http://localhost:3030/tmp/${fileName}`, {
          app: {
            name: apps.chrome,
            arguments: ["--allow-file-access-from-files"],
          },
        });
        const refreshServer = new RefreshServer();
        refreshServer.listenForCO2Changes();
      });
    }

    if (snippet) {
      return body;
    } else {
      return fileName;
    }
  }

  public renderCO2OutputExcel(url: string) {
    this.outputCO2.map((output) => {
      output.size = bytes(output.CO2Data.totalBytes);
      output.CO2Data.co2Formatted = output.CO2Data.co2.toPrecision(3);
      output.CO2Data.rating = this.getRating(output.CO2Data.co2);
    });

    const styles = {
      headerDark: {
        fill: {
          fgColor: {
            rgb: "FFCCCCCC",
          },
        },
        font: {
          color: {
            rgb: "FF000000",
          },
          sz: 14,
          bold: true,
        },
        alignment: {
          vertical: "top",
        },
      },
      cell: {
        alignment: {
          vertical: "top",
        },
      },
    };

    const specification = {
      url: {
        displayName: "URL",
        headerStyle: styles.headerDark,
        width: 300,
      },
      co2: {
        displayName: "CO² (g)",
        headerStyle: styles.headerDark,
        width: 200,
      },
      rating: {
        displayName: "Rating",
        headerStyle: styles.headerDark,
        width: 200,
      },
    };

    const dataset = [];

    this.outputCO2.forEach((outputType) => {
      const row = {
        url: {
          value: outputType.url,
          style: styles.cell,
        },
        co2: {
          value: outputType.CO2Data.co2Formatted,
          style: styles.cell,
        },
        rating: {
          value: outputType.CO2Data.rating,
          style: styles.cell,
        },
      };
      dataset.push(row);
    });

    const report = excel.buildExport([
      {
        name: "Report CO2",
        specification: specification,
        data: dataset,
      },
    ]);

    const fileName = `co2-${url.replace(/[^a-zA-Z0-9]/g, "")}.xlsx`;
    const path = `./public/excel/${fileName}`;
    fs.writeFileSync(path, report);

    open.default(path, {
      app: {
        name: apps.chrome,
        arguments: ["--allow-file-access-from-files"],
      },
    });
    return path;
  }

  private getRating(co2: number) {
    if (co2 < 0.04) {
      return "A+";
    } else if (co2 < 0.079) {
      return "A";
    } else if (co2 < 0.145) {
      return "B";
    } else if (co2 < 0.209) {
      return "C";
    } else if (co2 < 0.278) {
      return "D";
    } else if (co2 < 0.359) {
      return "E";
    } else {
      return "F";
    }
  }

  private getRatingColor(rating: string) {
    switch (rating) {
      case "A+":
      case "A":
        return "bg-green-200";
      case "B":
        return "bg-yellow-200";
      case "C":
        return "bg-yellow-400";
      case "D":
        return "bg-orange-400";
      case "E":
        return "bg-red-300";
      case "F":
        return "bg-red-600";
      default:
        return "";
    }
  }
}
