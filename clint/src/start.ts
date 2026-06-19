/// <reference types="vite/client" />
import colors from "colors";
import prompts from "prompts";
import { TesterFlow } from "./tester/testerflow";
import { UpdaterFlow } from "./updater/updaterflow";
import { AuthorFlow } from "./updater/authorflow";
import { UpdateChecker } from "./updater/updateChecker";
import { UpdateIndex } from "./updater/updateIndex";
import { UpdateNew } from "./updater/updateNew";

export class Start {
  constructor() {
    this.runInit();
  }

  private async runInit() {
    console.clear();
    process.stdout.write("·······································\n");
    process.stdout.write(":                                     :\n");
    process.stdout.write(":   _________ .__  .__        __      :\n");
    process.stdout.write(":   \\_   ___ \\|  | |__| _____/  |_    :\n");
    process.stdout.write(":   /    \\  \\/|  | |  |/    \\   __\\   :\n");
    process.stdout.write(":   \\     \\___|  |_|  |   |  \\  |     :\n");
    process.stdout.write(":    \\______  /____/__|___|  /__|     :\n");
    process.stdout.write(":           \\/             \\/         :\n");
    process.stdout.write(":                                     :\n");
    process.stdout.write("·······································\n\n");

    const startChoice: prompts.PromptObject = {
      type: "select",
      name: "value",
      message: "What do you want to run?",
      choices: [
        { title: "Update", value: "update" },
        { title: "Test", value: "test" },
        { title: "Author update (base repo)", value: "author" },
        { title: "Exit", value: "exit" },
      ],
      initial: 0,
    };
    let updateCli;
    let updateFrontend;

    try {
      updateCli = await UpdateChecker.checkCliForUpdates();
      updateFrontend = await UpdateChecker.checkFrontendForUpdates();
      if (updateCli.update || updateFrontend.update) {
        process.stdout.write("---------------------------------------------------------------------------\n");
      }

      if (updateCli.update) {
        process.stdout.write(
          `| 🐦‍🔥 There is an update available for the CLI: ${colors.yellow(
            updateCli.currentVersion
          )} -> ${colors.green(updateCli.latestVersion)}\n`
        );
      }
      if (updateFrontend.update) {
        if (updateFrontend.appliedMissing) {
          process.stdout.write(
            `| 🎨 Frontend update state not initialised — a migration will run on first update.\n`
          );
        } else {
          const count = updateFrontend.pending.length;
          process.stdout.write(
            `| 🎨 ${colors.green(String(count))} frontend update${count === 1 ? '' : 's'} available: ${updateFrontend.pending
              .map((u) => u.title)
              .join(', ')}\n`
          );
        }
      }

      if (updateCli.update || updateFrontend.update) {
        process.stdout.write("---------------------------------------------------------------------------\n\n");
      }
    } catch (error) {
      console.error(`Failed to check for updates: ${error?.message ?? error}`);
    }

    const choice = await prompts(startChoice);

    switch (choice.value) {
      case "update":
        new UpdaterFlow(updateCli, updateFrontend);
        break;
      case "test":
        new TesterFlow();
        break;
      case "author":
        new AuthorFlow();
        break;
      default:
        console.log("No valid choice made, exiting.");
        process.exit(0);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Authoring commands (run on statikbe/craft, not by consumers).
  if (args[0] === "update:index") {
    UpdateIndex.generate();
    return;
  }
  if (args[0] === "update:new") {
    UpdateNew.scaffold(args.slice(1).join(" "));
    return;
  }

  let startPrompt = true;
  for (const val of process.argv) {
    if (val === "--checkupdates") {
      try {
        const updateCli = await UpdateChecker.checkCliForUpdates("../clint/");
        const updateFrontend = await UpdateChecker.checkFrontendForUpdates("../clint/");
        if (updateCli.update || updateFrontend.update) {
          process.stdout.write("---------------------------------------------------------------------------\n");
        }

        if (updateCli.update) {
          process.stdout.write(
            `| 🐦‍🔥 There is an update available for the CLI: ${colors.yellow(
              updateCli.currentVersion
            )} -> ${colors.green(updateCli.latestVersion)}\n`
          );
        }
        if (updateFrontend.update) {
          if (updateFrontend.appliedMissing) {
            process.stdout.write(
              `| 🎨 Frontend update state not initialised — a migration will run on first update.\n`
            );
          } else {
            const count = updateFrontend.pending.length;
            process.stdout.write(
              `| 🎨 ${colors.green(String(count))} frontend update${count === 1 ? "" : "s"} available: ${updateFrontend.pending
                .map((u) => u.title)
                .join(", ")}\n`
            );
          }
        }

        if (updateCli.update || updateFrontend.update) {
          process.stdout.write("---------------------------------------------------------------------------\n\n");
        }
      } catch (error) {
        console.error(`Failed to check for updates: ${error?.message ?? error}`);
      }
      startPrompt = false;
    }
  }

  if (startPrompt) {
    new Start();
  }
}

main();
