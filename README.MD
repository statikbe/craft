# Craft CMS starter package by Statik.be

This a scaffolding package for Craft CMS, by [Statik.be](https://www.statik.be). We use this internally to start new projects.

What changed in recent releases: [WHAT'S NEW](WHATS-NEW.md).

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
- Database server name or IP address [127.0.0.1]
- Database port [3306]
- Database username [root]
- Database password
- Database name
- Database table prefix

➡️ Using the above defaults suggested by craft, will allow you to connect to your Ddev database and the installation will continue.

- Install Craft now? [yes]
- Email
- Password
- Confirm
- Site name [NL]
- Site URL [@baseUrl/nl]
- Site language [nl-BE]

➡️ Craft is installed, the plugins are installed and the existing project config is applied! 🚀

Now we're ready to initiate the Statik set-up:

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
- Enter the project code (replaces `[PROJECT_CODE_HERE]` in `deploy.php`, `hosts.yml` and the `htaccess-*` files in `config/`)
- Do you want to remove the frontend account flow in Craft?

If you continue the next sections will be removed: _confirmAccount, editPassword, editProfile, forgotPassword, forgotPasswordConfirmation, login, profile, register, registrationCompleted, setPassword, setPasswordConfirmation_

- Do you want to use [Postmark](https://account.postmarkapp.com/servers) for email transport? (yes|no)
  - Enter a Postmark API key
  - Enter an email address to use for testing on staging environments
- Do you want to use reCAPTCHA for spam protection? (yes|no)
  - Enter a reCAPTCHA site key and secret key (written to `.env`; the setup also turns Formie's reCAPTCHA captcha on with them. Turn it on in each form's Spam settings)
- Do you want to set up a git repo for this project? (yes|no)
  - Add a remote?
- Do you want to initialize [git-flow](https://nvie.com/posts/a-successful-git-branching-model/)? (yes|no), only asked when git-flow is installed

➡️ The installation is ready!

---

### 🎨 Frontend Setup

We use Tailwind CSS 4 and Vite

- `frontend/vite.config.js`
- `frontend/css/site/theme.css`: the Tailwind theme (colours, fonts, spacing, component tokens)

All frontend commands run from `frontend/` (there is no `package.json` at the root).

Getting started

```bash

cd frontend
[optional] nvm install
yarn start

```

`yarn start` runs `composer install` and `yarn install`, makes a production build, builds Clint and enables the git hooks in `.githooks/`.

Afterwards you can build using

```bash

yarn prod

```

or run the Vite dev server with hot reload (it also checks for Clint updates)

```bash

yarn watch

```

**CSS and Javascript**

`frontend/css` and `frontend/js`

**Favicon**
Add an svg in `frontend/img/site/` called `favicon.svg` and run

```bash

yarn favicon

```

**Icons**
Icon go in the folder `frontend/icons`

---

### 🧪 Testing

The site tests (accessibility, HTML validation, links and CO2) run through [Clint](clint/README.md), Statik's frontend updater and testing tool:

```bash

cd clint
yarn build
yarn start

```

or `yarn update` from `frontend/`. Clint opens an interactive menu to apply frontend updates and run the tests. The `start` script sets `NODE_EXTRA_CA_CERTS` from mkcert, so the local HTTPS site is trusted. See the [Clint documentation](https://statikbe.github.io/craft/frontend/clint/tests.html) for the tests and their configuration.

### ⚙️ Development

To work on this repo you can clone it like you would a regular project:

```

git clone git@github.com:statikbe/craft.git craft

```

Pull requests target `develop`. What changed per release is in [WHATS-NEW.md](WHATS-NEW.md).

---

### ⭐️ Features & support

We'd love the hear your suggestions and review your pull requests, but keep in mind that is repo is for internal projects first.
