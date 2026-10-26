# Accounts

The base install comes with a front-end account flow: visitors can register, log in, edit their profile and reset their
password on the site itself, not in the control panel. Each step is a single with the *Simple page* entry type (title, intro,
SEO), so editors write the texts; the forms are in the templates.

## Turning it on or off

`statik/setup` asks *"Do you want to remove the frontend account flow in Craft?"*:

- **No** (default): `PUBLIC_ACCOUNT_FLOW=1` in `.env`.
- **Yes**, confirmed: the account sections and `templates/_site/_account` are deleted and `PUBLIC_ACCOUNT_FLOW=0`.

With `PUBLIC_ACCOUNT_FLOW` on, `config/general.php` points Craft's own paths to the account pages, per site:

| Setting                      | NL                       | EN                        | FR                         |
| ---------------------------- | ------------------------ | ------------------------- | -------------------------- |
| `loginPath`                  | `/aanmelden`             | `/login`                  | `/inscrivez-vous`          |
| `setPasswordPath`            | `/wachtwoord-vernieuwen` | `/renew-password`         | `/renouveler-mot-de-passe` |
| `activateAccountSuccessPath` | `/registratie-voltooid`  | `/registration-completed` | `/inscription-terminee`    |
| `setPasswordSuccessPath`     | `/wachtwoord-ingesteld`  | `/password-set`           | `/mot-de-passe-ensemble`   |

Change a page's URI in its section and you have to change it here too.

The user settings in project config allow public registration and require email verification.

## The pages

| Section                      | Template (`_site/_account/`)               | What it does                                                                 |
| ---------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| `register`                   | `_register.twig`                           | Form (first name, last name, email, password twice) → `users/save-user`; then to *Confirm your account* |
| `confirmAccount`             | `_registrationConfirmation.twig`           | "Check your mailbox" after registering                                       |
| `registrationCompleted`      | `_registrationCompleted.twig`              | After clicking the activation link (`activateAccountSuccessPath`)            |
| `login`                      | `_login.twig`                              | Form → `users/login`; then to *Profile*. Links to *Forgot password*          |
| `profile`                    | `_profile.twig`                            | Links to *Edit profile*, *Edit password* and log out; requires login. Shows the user's first name, last name and email address |
| `editProfile`                | `_edit.twig`                               | Form → `users/save-user`; back to *Profile*; requires login                  |
| `editPassword`               | `_editPassword.twig`                       | Form → `users/save-user`; back to *Profile*; requires login                  |
| `forgotPassword`             | `_passwordRequestReset.twig`               | Form → `users/send-password-reset-email`; then to *Forgot password confirmation* |
| `forgotPasswordConfirmation` | `_passwordRequestResetConfirmation.twig`   | "Check your mailbox" after requesting a reset                                |
| `setPassword`                | `_passwordSet.twig`                        | New password from the email link (`setPasswordPath`) → `users/set-password`  |
| `setPasswordConfirmation`    | `_passwordSetConfirmation.twig`            | After setting the password (`setPasswordSuccessPath`)                        |

The URIs per site are listed on [Sections](./sections#account-pages). The labels and messages of the forms are in the
`website_name` translations (`account.*` keys), see [Translations](../templates/translations).

The emails (activation, password reset) are Craft's system messages, in the mail layout of the project config email settings
(`_mail/_layout`); see
[Environments and .env](../getting-started/environments) for the mail settings.

## Source

- `config/general.php` (the `PUBLIC_ACCOUNT_FLOW` block)
- `config/project/users/users.yaml`
- `modules/statik/src/console/controllers/SetupController.php` (`removeAccountFlow()`)
- `templates/_site/_account/`
