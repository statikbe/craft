# Craft CMS starter package by Statik.be
This a scaffolding package for Craft CMS, by [Statik.be](https://www.statik.be). We use this internally to start new projects.

### Assumptions made
We assume a couple of things
- We use [Mandrill](https://mandrillapp.com) for email delivery.
- We use [statikbe/webpack](https://github.com/statikbe/webpack) for our frontend build.
- We don't use Craft's `projectConfig`, it is only enabled here so we can store settings in it for the scaffolding repo.

---
### Usage

Use the following command to set up a new project:
````
composer create-project statikbe/craft PATH
````

Then install Craft:

````bash
cd PATH
./craft setup
````

Then run the Statik specific setup:

````bash
./craft statik/setup
````

This will give you the following options/ask you the following questions:
- Do you want to change the system for the site you're setting up?
- Do you want to disable projectConfig? (default: yes)
- Do you want to use Mandrill for email transport? (default: yes, will prompt you to entry an API key)
- Do you want to use statikbe/webpack for your frontend build? (default: yes, will prompt you to run `yarn install`)
- Do you want to add dummy content? (default: yes, uses [studioespresso/seeder](https://github.com/studioespresso/craft3-seeder/) to add dummy entries to all channels)
- Do you want to initialize a git repository in the new project? (default: yes)
    - Do you want to add a remote?
    - Do you want to initiliaze [git-flow](https://nvie.com/posts/a-successful-git-branching-model/)? (default: yes)

----
### Development
To work on this repo you can clone it like you would a regular project:
````
git clone git@github.com:statikbe/craft.git craft
````
To make sure the changes you make in the CMS can be commited, you'll have to add `PROJECT_CONFIG="1"` to your `.env` file.

---
### Features & support
We'd love the hear your suggestions and review your pull requests, but keep in mind that is repo is for internal projects first.