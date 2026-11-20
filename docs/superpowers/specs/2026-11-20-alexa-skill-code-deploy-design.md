# Design: Code-Based Alexa Skill Deployment

## Intent & Why

Make this repository the single source of truth for deploying and running the entire Alexa skill (AWS Lambda + Alexa skill manifest + interaction model), replacing manual configuration in the Alexa Developer Console. Home Assistant configuration remains out of scope for now.

## Goals, Non-Goals & Anti-Goals

- **Goals**
  - Version-control the `pt-BR` interaction model (`meu assistente`, `OpenPageIntent`, built-in intents) and skill manifest (`ALEXA_PRESENTATION_APL` interface, metadata, Lambda endpoint).
  - Provide a single `npm run deploy` command that deploys the Lambda and updates the Alexa skill end-to-end, plus targeted scripts (`deploy:lambda`, `deploy:model`, `deploy:skill`).
  - Automatically resolve the Alexa Skill ID from AWS SSM (`/ha-assistant-skill/id`) and the deployed Lambda ARN from AWS — no duplicated manual env vars.
  - Safely adopt the existing live Alexa skill by supporting an initial pull (`npm run skill:pull`) of its current manifest so existing console settings are not accidentally wiped.
- **Non-Goals**
  - Managing Home Assistant dashboards or configuration.
  - Replacing Serverless Framework v4 for AWS Lambda deployment.
- **Anti-Goals**
  - Hardcoding Skill IDs, AWS account IDs, Lambda ARNs, or LWA credentials in committed files.
  - Blindly overwriting the live skill manifest with a hand-written template before exporting the existing one.

## Constraints

- Follow `AGENTS.md`: Node.js ESM (`"type": "module"`), tabs, single quotes, no semicolons, `npm run lint` clean.
- Keep `documents/**` packaged in the Lambda zip; exclude `skill-package/**`, `scripts/**`, and `docs/**` from the Lambda zip.
- Ignore `.ask/` in `.gitignore` so local ASK CLI state is never committed.
- Do not require a globally installed `aws` CLI or `ask` CLI; use `devDependencies` (`ask-cli`, `@aws-sdk/client-ssm`, `@aws-sdk/client-lambda`) so the repo is self-contained.

## Approaches Considered

1. **Serverless v4 for Lambda + SMAPI script wired to AWS (Picked)**
   - Keeps `serverless.yml` and SSM parameters intact, adds `skill-package/` and a lightweight `scripts/deploy-skill.js` (plus `skill:pull`) using `ask smapi` and AWS SDK v3.
   - *Why picked*: Low risk, adopts the existing skill cleanly, eliminates manual env-var duplication, and gives one unified `npm run deploy` command.
2. **Replace Serverless with pure ASK CLI (`ask deploy`)**
   - Single native Amazon tool, but requires migrating Lambda and SSM wiring into ASK CloudFormation templates and managing `.ask/ask-states.json` outside git.
3. **Embed `AWS::Ask::Skill` in `serverless.yml`**
   - Single CloudFormation stack, but requires uploading a zipped skill package to S3, storing LWA OAuth tokens in SSM, and does not cleanly adopt an existing Skill ID.

## Decisions & Calls

- **Decided together**: Single-repo end-to-end Alexa skill deployment (excluding Home Assistant) using Approach 1.
- **Proposed calls (adjust if needed)**:
  - Adopt the existing skill stored in SSM `/ha-assistant-skill/id` and include `npm run skill:pull` to bootstrap `skill-package/skill.json` from the live skill before the first push.
  - Default locale `pt-BR` and Alexa stage `development` (with `--stage` support for Serverless stage `dev` by default).
  - Resolve the Lambda ARN via `@aws-sdk/client-lambda` (using the same AWS credentials Serverless uses) and substitute `__LAMBDA_ARN__` in-memory when pushing `skill.json`.

## Left to the Builder

- Exact CLI flag parsing (`--model-only`, `--dry-run`, `--stage`) and error messages in `scripts/deploy-skill.js`.
- Polling interval/timeout when waiting on `ask smapi get-skill-status`.
- Temporary file creation and cleanup when rendering `skill.json` with the resolved Lambda ARN.
