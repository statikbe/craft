import ValidationComponent from '../../components-base/validation.component';

export interface ValidationPluginConstructor {
  new (validationComponent?: ValidationComponent, options?: {}): ValidationPlugin;
}

export interface ValidationPlugin {
  initElement(): void;
}
