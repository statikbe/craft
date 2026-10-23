import prompts from "prompts";
import { UpdateNew } from "./updateNew";
import { UpdateIndex } from "./updateIndex";

/**
 * Interactive authoring flow (base-repo maintainers). Wraps the `update:new` scaffolder and the
 * `update:index` generator so they don't have to be invoked via `node dist/cli.js ...`.
 * The argv commands stay available for CI and scripting.
 *
 * `update:index` is a local validation/preview step only: the manifest is gitignored on
 * development branches and generated onto the `clint-updates` branch by CI at publish time, so
 * there is nothing to commit after running it.
 */
export class AuthorFlow {
  constructor() {
    console.clear();
    this.start();
  }

  private async start() {
    const choice = await prompts({
      type: "select",
      name: "value",
      message: "Author a frontend update (base repo)",
      choices: [
        { title: "New update (scaffold folder)", value: "new" },
        { title: "Validate update folders (preview manifest)", value: "index" },
        { title: "Nothing (Exit)", value: "exit" },
      ],
      initial: 0,
    });

    switch (choice.value) {
      case "new": {
        const title = await prompts({
          type: "text",
          name: "value",
          message: "What's the update title?",
        });
        if (!title.value || !title.value.trim()) {
          console.log("No title provided, aborting.");
          return;
        }
        UpdateNew.scaffold(title.value.trim());

        console.log(
          "\nℹ️  Nothing else to commit but the folder — CI generates the manifest on publish. " +
            'Run "update:index" any time to validate the folders locally.'
        );
        break;
      }
      case "index":
        UpdateIndex.generate();
        break;
      default:
        console.log("Exiting.");
    }
  }
}
