# Usage

The goal of this page is to give you some ideas how you can use this skill.

## Using routines

If you successfully installed the skill, you should be able to open views with a command like

```html
Alexa, tell dashboard viewer open page <number>
```

While this of course works, it is a bit inconvenient because you need to memorize a number for each view. Therefore, I use routines to invoke the skill. Just use the "custom" action in the routine and type in the command you would normally use to invoke the skill, e.g.

```html
Alexa, tell dashboard viewer open page 3
```

This way the routine basically acts as an alias for the skill command. As a bonus, you can also instruct Alexa to say something (e.g. "OK") before opening the view. 

## Open views from Home Assistant

You can use the [Alexa Media Player](https://github.com/custom-components/alexa_media_player) to open a view on the Echo Show from Home Assistant (e.g. in an automation). This custom component makes it possible run routines from Home Assistant (how is described [here](https://github.com/custom-components/alexa_media_player/wiki#alexa-routines)) which then can be used to invoke the skill as described above.
