import { ValidationPlugin } from "./plugin.interface";

export class TestPlugin implements ValidationPlugin {
  constructor() {
    const test = "TestPlugin";
  }

  public initElement() {
    console.log("Test init");
  }
}
