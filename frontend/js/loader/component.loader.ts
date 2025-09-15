import { DOMHelper } from '../utils/domHelper';

export class ComponentLoader {
  public async loadComponent(componentName, selector, plugins = []) {
    const selectors = [selector, ...plugins.map((p) => p.selector)];
    const elements = document.querySelectorAll(selectors.join(','));
    if (elements.length > 0) {
      this.initComponent(componentName, plugins);
    }

    DOMHelper.onDynamicContent(document.documentElement, selectors.join(','), (elements) => {
      this.initComponent(componentName, plugins);
    });
  }

  private async initComponent(componentName, plugins) {
    const component = await import(`../components/${componentName}.component.ts`);
    if (plugins.length > 0) {
      const pluginLoading = [];
      plugins.forEach((plugin) => {
        const element = document.querySelector(plugin.selector);
        if (!element) {
          return;
        }
        pluginLoading.push(
          new Promise(async (resolve, reject) => {
            const pluginModule = await import(`../plugins/${plugin.path}/${plugin.file}.ts`);
            resolve({ name: plugin.name, selector: plugin.selector, module: pluginModule[plugin.name] });
          })
        );
      });
      Promise.all(pluginLoading).then((loadedPlugins) => {
        new component['default']({
          plugins: loadedPlugins,
        });
      });
    } else {
      new component['default']();
    }
  }
}
