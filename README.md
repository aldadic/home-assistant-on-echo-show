# Alexa Skill to display Lovelace dashboards on Echo Show

This Alexa skill adds a voice command to open Lovelace dashboards on the Echo Show in the built-in Silk browser.

## How it works

TBD

## Interaction Model

- **Invocation Name**: `meu assistente`

### Intents

- `OpenPageIntent`: Opens a page/camera view using the `page` (`AMAZON.NUMBER`) slot.
  - Sample utterances:
    - `abrir {page}`
    - `abrir console`
    - `abrir console {page}`
- Built-in intents:
  - `AMAZON.CancelIntent`
  - `AMAZON.HelpIntent`
  - `AMAZON.StopIntent`
  - `AMAZON.NavigateHomeIntent`
  - `AMAZON.FallbackIntent`

### Interaction Model JSON

```json
{
    "interactionModel": {
        "languageModel": {
            "invocationName": "meu assistente",
            "intents": [
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.NavigateHomeIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.FallbackIntent",
                    "samples": []
                },
                {
                    "name": "OpenPageIntent",
                    "slots": [
                        {
                            "name": "page",
                            "type": "AMAZON.NUMBER"
                        }
                    ],
                    "samples": [
                        "abrir {page}",
                        "abrir console",
                        "abrir console {page}"
                    ]
                }
            ],
            "types": []
        }
    }
}
```

## Installation

For instructions how to set this skill up refer to the [installation](INSTALLATION.md) page.

## How to use

Once you've set this skill up refer to the [usage](USAGE.md) page for details how to use this skill effectively.
