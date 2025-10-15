# A11yTester

Tool to test websites for A11y issues, HTML errors and broken links.

## How to use this tool

This tool is meant to be a developer helper tool. So some technical knowledge is required.

### Setup

- Clone this tool locally. Then run `yarn install`.
- Then copy the file `.env.example` to a new `.env` file. Adjust the setting to your needs. See the options section for more info.
- Run `yarn build-cli`
- Run `yarn build`
- Run `yarn cli`
- Test da sh\*t

### Options

There are some extra options you can use to configure the tool.

> ⚠️ When you change some parameters. Always run `yarn build-cli` afterwards

#### VITE_ENVIRONMENT

There are 2 environments:

You have a local and a production environment. The local environment is meant to do the testing local on your machine. This doesn't mean you can not test remote websites. But everything is handled on your machine and is setup to work well for local testing.

The production environment is meant to be triggered by a chronjob on a server.

#### VITE_OUTPUT

The CLI has 3 options:

- `cli`: this will output all the errors to the Terminal.
- `html`: This wil output all the errors to a HTML file. This file will open automatically in the chrome browser.
- `cli-choose`: This will give you an extra step in the process. It will ask you as a first step if you want to export to the terminal or to HTML.

#### VITE_VERBOSE

When set to false no output during the testing will be given in the terminal.

#### VITE_RUN_SERVER

When testing locally you can activate a local server. This makes it possible to retest a link from the interface of the HTML export.

### Local testing

### Production testing

## Ideas for improvements

- Make a cronjob with the following options:
  - Post to a slack channel if errors are encountered (https://dev.to/hrishikeshps/send-slack-notifications-via-nodejs-3ddn)
