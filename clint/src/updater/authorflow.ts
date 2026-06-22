import prompts from "prompts";
import { UpdateNew } from "./updateNew";
import { UpdateIndex } from "./updateIndex";

/**
 * Interactive authoring flow (base-repo maintainers). Wraps the `update:new` scaffolder and the
 * `update:index` manifest generator so they don't have to be invoked via `node dist/cli.js ...`.
 * The argv commands stay available for CI and scripting.
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
        { title: "Regenerate manifest (index.json)", value: "index" },
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

        const regen = await prompts({
          type: "select",
          name: "value",
          message: "Regenerate the manifest (index.json) now?",
          choices: [
            { title: "Yes", value: "yes" },
            { title: "No, I'll fill in the update first", value: "no" },
          ],
          initial: 0,
        });
        if (regen.value === "yes") {
          UpdateIndex.generate();
        } else {
          console.log("\nℹ️  When done editing the update, run \"update:index\" (menu or CLI) and commit index.json.");
        }
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
