import { DOMHelper } from '../utils/domHelper';

export class ComponentLoader {
  public async loadComponent(componentName, className, selector, plugins = []) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      this.initComponent(componentName, className, plugins);
    }

    DOMHelper.onDynamicContent(document.documentElement, selector, (elements) => {
      this.initComponent(componentName, className, plugins);
    });
  }

  private async initComponent(componentName, className, plugins) {
    const component = await import(`../components/${componentName}.component.ts`);
    if (plugins.length > 0) {
      const pluginLoading = [];
      plugins.forEach((plugin) => {
        pluginLoading.push(
          new Promise(async (resolve, reject) => {
            const pluginModule = await import(`../plugins/${plugin.path}/${plugin.file}.ts`);
            resolve(pluginModule[plugin.name]);
          })
        );
      });
      Promise.all(pluginLoading).then((pluginModules) => {
        new component[className]({
          plugins: pluginModules,
        });
      });
    } else {
      new component[className]();
    }
  }
}
