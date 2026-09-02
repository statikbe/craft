# Craft CMS starter package by Statik.be

This a scaffolding package for Craft CMS, by [Statik.be](https://www.statik.be). We use this internally to start new projects.

### Assumptions made

We assume a couple of things

- We use [Ddev](https://ddev.com/) as our local development environment.

- We use [Postmark](https://postmarkapp.com/) for email delivery.

- We use [TailwindCSS](https://tailwindcss.com/) for our frontend build.

---

### 🛠 Usage

Before beginning make sure you have [Ddev](https://ddev.com/) installed and your docker-engine is running. Otherwise the install process will fail on initialization.

Use the following command to set up a new project:

```bash

composer create-project statikbe/craft PATH

```

➡️ DDEV config will be created based on the following questions:

- Project name (craft-base-install) [project name]
- Docroot Location (public)
- Project Type [backdrop, craftcms, django4, drupal10, drupal6, drupal7, drupal8, drupal9, laravel, magento, magento2, php, python, shopware6, silverstripe, typo3, wordpress] (craftcms): [craftcms]

➡️ DDEV will automatically start up the containers and set up the database.

➡️ A Craft CMS project will be created. Next Craft asks to start the set-up:

```bash
   ______ .______          ___       _______ .___________.
  /      ||   _  \        /   \     |   ____||           |
 |  ,----'|  |_)  |      /  ^  \    |  |__   `---|  |----`
 |  |     |      /      /  /_\  \   |   __|      |  |
 |  `----.|  |\  \----./  _____  \  |  |         |  |
  \______|| _| `._____/__/     \__\ |__|         |__|

     A       N   E   W       I   N   S   T   A   L   L
               ______ .___  ___.      _______.
              /      ||   \/   |     /       |
             |  ,----'|  \  /  |    |   (----`
             |  |     |  |\/|  |     \   \
             |  `----.|  |  |  | .----)   |
              \______||__|  |__| |_______/


Generating an application ID ... done
Generating a security key ... done

Welcome to Craft CMS!

Are you ready to begin the setup? (yes|no) [yes]
```

➡️ The next questions will be asked:

- Which database driver are you using? (mysql or pgsql)
- Database server name or IP address [db]
- Database port [3306]
- Database username [db]
- Use the password provided by $CRAFT_DB_PASSWORD? (yes|no) [yes]
- Database name [db]
- Database table prefix

➡️ Using the above defaults suggested by craft, will allow you to connect to your Ddev database and the installation will continue.

- Install Craft now? (yes|no) [yes]
- Email
- Password
- Confirm
- Site name [NL]
- Site URL [@baseUrl/nl]
- Site language [nl-BE]

➡️ Craft is installed, the plugins are installed and the existing project config is applied! 🚀

Now we're ready to initiate the Statik set-up inside the project folder:

```bash

cd PATH

ddev craft statik/setup

```

➡️ This will give you the following options/ask you the following questions:

```bash
       _______.___________.    ___   .___________.__   __  ___
        /       |           |   /   \  |           |  | |  |/  /
       |   (----`---|  |----`  /  ^  \ `---|  |----|  | |  '  /
        \   \       |  |      /  /_\  \    |  |    |  | |    <
    .----)   |      |  |     /  _____  \   |  |    |  | |  .  \
    |_______/       |__|    /__/     \__\  |__|    |__| |__|\__\

       A     N  E  W     C  R  A  F  T     P  R  O  J  E  C  T

```

- Enter a new system name
- Enter the project code
- Do you want to remove the frontend account flow in Craft?
- Are you sure? The next sections will be removed: confirmAccount, editPassword, editProfile, forgotPassword, forgotPasswordConfirmation, login, profile, register, registrationCompleted, setPassword, setPasswordConfirmation (yes|no)
- Do you want to use [Postmark](https://account.postmarkapp.com/servers) for email transport? (yes|no)
  - Enter a Postmark API key
- Enter an emailaddress to use for testing on staging environments
- Do you want to use Recaptcha for spam protection? (yes|no)
  - Enter a Recaptcha site key
- Do you want to set up a [git repo](https://bitbucket.org/statikbe) for this project? (yes|no)
  - Add a remote?
- Do you want to initialize [git-flow](https://nvie.com/posts/a-successful-git-branching-model/)? (yes|no)

➡️ The installation is ready!

---

### ✨ Clint Setup

Clint is Statik's internal frontend updater and testing tool for Craft CMS projects. Clint offers automated updates, site testing, smart detection and visual reports. Find the full documentation at [https://statikbe.github.io/craft/frontend/clint/introduction.html](https://statikbe.github.io/craft/frontend/clint/introduction.html)

Getting started

```bash

  cd clint
  yarn install
  yarn build

```

Afterwards you can start Clint using

```bash

yarn start

```

---

### 🎨 Frontend Setup

We use tailwindscss and vite.js

- `vite.config.js`
- `tailwind.config.js`

Getting started

```bash

cd frontend
[optional] nvm install
yarn install

```

Afterwards you can build using

```bash

yarn dev

```

or

```bash

yarn watch

```

**CSS and Javascript**

CSS and Javascript files go in `frontend/css` and `frontend/js`

**Favicon**

Add an svg in `frontend/img/` called `favicon.svg` and run

```bash

yarn favicon

```

**Icons**

Icons go in the folder `frontend/icons`

**Fonts**

Google fonts can be added running

```bash

yarn googlefonts

```

---

### ⚙️ Development

To work on this repo you can clone it like you would a regular project:

```

git clone git@github.com:statikbe/craft.git craft

```

---

### ⭐️ Features & support

We'd love the hear your suggestions and review your pull requests, but keep in mind that is repo is for internal projects first.
