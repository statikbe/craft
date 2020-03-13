declare global {
  interface Number {
    countDecimals(): Number;
  }
}

//Number.prototype.countDecimals = countDecimals;
export function countDecimals() {
  if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
  return this.toString().split(".")[1].length || 0;
}
