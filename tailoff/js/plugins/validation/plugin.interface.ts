export interface ValidationPluginConstructor {
  new (): ValidationPlugin;
}

export interface ValidationPlugin {
  initElement(): void;
}
