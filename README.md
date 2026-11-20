# Home Assistant on Echo Show

An Alexa Skill that opens Home Assistant Lovelace dashboards and camera views on an Amazon Echo Show using the built-in Silk browser.

## How It Works

An AWS Lambda function (`index.js`) handles Alexa voice requests and responds with an Alexa Presentation Language (APL) `OpenURL` command, launching the target Home Assistant URL directly in the Echo Show's Silk browser.

Both the Lambda backend (`serverless.yml`) and the Alexa skill configuration (`skill-package/`) are managed in this repository.

## Voice Commands

- **Invocation name**: `meu assistente` (`pt-BR`)
- **Open default dashboard**: *"Alexa, abrir meu assistente"* -> opens `$HA_ENDPOINT/lovelace/default_view`
- **Open camera / page view** (`OpenPageIntent`): *"abrir console"*, *"abrir {page}"*, *"abrir console {page}"* -> opens `$CAMERA_ENDPOINT`

Built-in intents (`Cancel`, `Help`, `Stop`, `NavigateHome`, `Fallback`) are also supported. See [pt-BR.json](skill-package/interactionModels/custom/pt-BR.json) for the full interaction model.

## Setup

For first-time AWS and Alexa Developer Console setup, see [docs/INSTALLATION.md](docs/INSTALLATION.md).

Once your skill and AWS SSM parameters (`/ha-assistant-skill/id`, `/ha-assistant-skill/ha-endpoint`, `/ha-assistant-skill/camera-endpoint`) are in place:

1. Configure AWS credentials with access to Lambda and SSM.
2. Authenticate the Alexa Skills Kit CLI:

   ```bash
   npx ask configure
   ```

3. *(Optional, recommended before first deploy)* Pull your live Alexa skill manifest and interaction model into `skill-package/`:

   ```bash
   npm run skill:pull
   ```

## Deploying

| Command | Description |
| --- | --- |
| `npm run deploy` | Deploy AWS Lambda, Alexa manifest, and interaction model |
| `npm run deploy:lambda` | Deploy AWS Lambda only |
| `npm run deploy:skill` | Deploy Alexa skill manifest and interaction model |
| `npm run deploy:model` | Deploy Alexa interaction model only |
| `npm run skill:pull` | Sync live Alexa manifest and model down to `skill-package/` |

> The Alexa scripts automatically read the Skill ID from SSM (`/ha-assistant-skill/id`) and the Lambda ARN from AWS. You can pass `--stage <stage>`, `--locale <locale>`, or `--dry-run` (e.g., `npm run deploy:skill -- --dry-run`).

## Usage & Development

- **Usage tips**: See [docs/USAGE.md](docs/USAGE.md).
- **Runtime**: Node.js 26 (`nodejs26.x`).
- **Linting**: Run `npm run lint` to check formatting or `npm run lintfix` to auto-fix.
