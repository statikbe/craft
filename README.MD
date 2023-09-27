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
- Do you want to remove the frontend account flow in Craft?

If you continue the next sections will be removed: _confirmAccount, editPassword, editProfile, forgotPassword, forgotPasswordConfirmation, login, profile, register, registrationCompleted, setPassword, setPasswordConfirmation_

- Do you want to use [Postmark](https://account.postmarkapp.com/servers) for email transport? (yes|no)
  - Enter a Postmark API key
- Enter an emailaddress to use for testing on staging environments
- Do you want to set up a [git repo](https://statik.beanstalkapp.com/) for this project? (yes|no)
  - Add a remote?
- Do you want to initialize [git-flow](https://nvie.com/posts/a-successful-git-branching-model/)? (yes|no)

➡️ The installation is ready!

---

### 🎨 Frontend Setup

We use tailwindscss and vite.js

- `vite.config.js`
- `tailwind.config.js`

Getting started

```bash

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

`tailoff/css` and `tailoff/js`

**Favicon**
Add an svg in `tailoff/img/` called `favicon.svg` and run

```bash

yarn favicon

```

**Icons**
Icon go in the folder `tailoff/icons`

---

### 🧪 Testing

There are two tests added to the frontend stack.
An A11y tester that uses pa11y-ci under the hood.
And a html tester that we wrote ourself, inspired by the pa11y code, that uses html-validate under the hood.
You can call them by using these commands:

```
$ yarn test-a11y
$ yarn test-html
```

They both use the BASE_URL variable from the .env file to get the craft sitemap. This sitemap gets parsed to get a list of all url's in the site. And the tests are then performed on these URL's.

**Attention**
To get the tester running on your local system. Run the following command in your terminal

```
export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"
```

### ⚙️ Development

To work on this repo you can clone it like you would a regular project:

```

git clone git@github.com:statikbe/craft.git craft

```

---

### ⭐️ Features & support

We'd love the hear your suggestions and review your pull requests, but keep in mind that is repo is for internal projects first.
