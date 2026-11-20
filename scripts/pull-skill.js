import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import {
	LAMBDA_ARN_PLACEHOLDER,
	parseArgs,
	resolveSkillId,
	runAskSmapi,
} from './aws-config.js'

function sanitizeManifest(manifest) {
	const customApi = manifest.manifest?.apis?.custom
	if (customApi?.endpoint?.uri?.startsWith('arn:aws:lambda:')) {
		customApi.endpoint.uri = LAMBDA_ARN_PLACEHOLDER
	}
	if (customApi?.regions) {
		for (const region of Object.values(customApi.regions)) {
			if (region?.endpoint?.uri?.startsWith('arn:aws:lambda:')) {
				region.endpoint.uri = LAMBDA_ARN_PLACEHOLDER
			}
		}
	}
	return manifest
}

async function main() {
	const options = parseArgs(process.argv.slice(2))
	const skillId = await resolveSkillId(options.region)

	console.log(`Pulling Alexa skill manifest (${options.alexaStage})...`)
	const manifestRaw = runAskSmapi(
		['get-skill-manifest', '-s', skillId, '-g', options.alexaStage],
		{ dryRun: options.dryRun, captureOutput: true },
	)

	console.log(
		`Pulling Alexa interaction model (${options.locale}, ${options.alexaStage})...`,
	)
	const modelRaw = runAskSmapi(
		[
			'get-interaction-model',
			'-s',
			skillId,
			'-g',
			options.alexaStage,
			'-l',
			options.locale,
		],
		{ dryRun: options.dryRun, captureOutput: true },
	)

	if (options.dryRun) {
		return
	}

	const manifestPath = resolve('skill-package', 'skill.json')
	const modelPath = resolve(
		'skill-package',
		'interactionModels',
		'custom',
		`${options.locale}.json`,
	)

	const sanitizedManifest = sanitizeManifest(JSON.parse(manifestRaw))
	const parsedModel = JSON.parse(modelRaw)

	mkdirSync(dirname(manifestPath), { recursive: true })
	mkdirSync(dirname(modelPath), { recursive: true })

	writeFileSync(
		manifestPath,
		`${JSON.stringify(sanitizedManifest, null, '\t')}\n`,
		'utf8',
	)
	writeFileSync(
		modelPath,
		`${JSON.stringify(parsedModel, null, '\t')}\n`,
		'utf8',
	)

	console.log(`Saved ${manifestPath}`)
	console.log(`Saved ${modelPath}`)
}

main().catch((err) => {
	console.error(err.message)
	process.exit(1)
})
