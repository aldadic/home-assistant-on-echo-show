# Alexa Skill to display Lovelace dashboards on Echo Show

This Alexa skill adds a voice command to open Lovelace dashboards on the Echo Show in the built-in Silk browser.

## How it works

Let's assume your Home Assistant URL is ``http://homeassistant.local:8123``. Home Assistant dashboard URLs then have the following structure:

```html
http://homeassistant.local:8123/<dashboard-url>/<view-url>
```

Let's assume you call the skill "dashboard viewer" (this can be changed). When you set this skill up you specify an invocation like

```html
Alexa, tell dashboard viewer to open page <number>
```

and a dashboard URL like

```html
http://homeassistant.local:8123/dashboard-url
```

When the skill is invoked, it uses the [OpenURL](https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-standard-commands-v1-5.html#open_url_command) APL command to open the page

```html
http://homeassistant.local:8123/dashboard-url/<number>
```

in the Silk browser on the Echo Show. That way you can open any view of the specified dashboard as long as you assign numbers as URLs.

## Installation

For instructions how to set this skill up refer to the [installation](INSTALLATION.md) page.

## How to use

Once you've set this skill up refer to the [usage](USAGE.md) page for details how to use this skill effectively.

## TODO

* Make it possible to import this skill via GitHub URL to simplify installation.
