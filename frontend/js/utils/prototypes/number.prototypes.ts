declare global {
  interface Number {
    countDecimals(): Number;
  }
}

export class NumberPrototypes {
  constructor() {}

  public static activateCountDecimals() {
    Number.prototype.countDecimals = function() {
      if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
      return this.toString().split(".")[1].length || 0;
    };
  }
}
