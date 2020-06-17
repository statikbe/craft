import { ValidationPlugin } from "./plugin.interface";

export class TestPlugin2 implements ValidationPlugin {
  constructor() {
    const test = "TestPlugin2";
  }

  public initElement() {
    console.log("Test2 init");
  }
}
