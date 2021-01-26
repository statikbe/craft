# Release notes for Statik.be's Craft scaffolding package

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## 1.6.1 - 2021-01-26
### Added
- Added custom field for titles in contentbuilder. This field contains a copy button to copy the slug to create an anchor link on the website. 🔗

## 1.6.0 - 2020-03-20
### Added
- Moved our entire frontend to tailwind 🎉

## 1.5.0 - 2020-02-21
### Added
- Craft 3.4
- Added our webpack config to this repo
- We're settings a language cookie on each request to be able to redirect the user back to their own language and they visit the homepage

### Removed
- Removed question to pull in statikbe/webpack as this is now in this repo.

## 1.4.0 - 2020-01-30
### Added
- Postmark! We're using Postmarkapp for email now, so this release includes `craftcms/postmark`, config settings to use Postmark and a question to add an API key
- We're also using Craft's `testToEmailAddress` option on staging now, and have added a question to customize that email address

### Updated
- Breadcrumbs snippet is now comptable with Google's [new structured data standard](https://webmasters.googleblog.com/2020/01/data-vocabulary.html?m=1)

### Removed
- We're no longer using `craftcms/mandrill` and are no longer sending email through Mandrillapp.

## 1.3.0 - 2020-01-02
### Added
- Added singles & templates for a full front-end user registration flow

## 1.2.0 - 2019-11-27
### Added
- Added mmikkel/cp-field-inspect plugin
- Section pages

### Fixed
- The git remote created throught `statik\setup` is now called origin

## 1.1.1 - 2019-11-20
### Fixed
- The cookie banner templates now use the provided translations for `fr-BE` & `en-BE`

## 1.1.0 - 2019-11-12
### Added
- Craft 3.3.15
- Added "project code" question to setup script
- Added Mailer config overwrites to use Mandrill on staging & production
- Updated Freeform settings to enable Spam folder

### Fixed
- Enabled all the setup questions again. 

## 1.0.0 - 2019-10-22
### Added
- Initial real release! 🎉 

