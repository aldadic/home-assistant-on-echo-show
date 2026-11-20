import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import {
	LAMBDA_ARN_PLACEHOLDER,
	parseArgs,
	resolveLambdaArn,
	resolveSkillId,
	runAskSmapi,
} from './aws-config.js'

const POLL_INTERVAL_MS = 3000
const MAX_POLL_ATTEMPTS = 60

function renderManifest(manifestPath, lambdaArn) {
	const raw = readFileSync(manifestPath, 'utf8')
	JSON.parse(raw)
	return raw.replaceAll(LAMBDA_ARN_PLACEHOLDER, lambdaArn)
}

async function waitForSkillBuild(skillId, { locale, checkManifest }) {
	console.log('Waiting for Alexa skill build to finish...')

	for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
		const output = runAskSmapi(['get-skill-status', '-s', skillId], {
			captureOutput: true,
		})
		const status = JSON.parse(output)

		const manifestState = status.manifest?.lastUpdateRequest?.status
		const modelState =
			status.interactionModel?.[locale]?.lastUpdateRequest?.status

		const states = [
			checkManifest ? { name: 'manifest', state: manifestState } : null,
			{ name: `interactionModel(${locale})`, state: modelState },
		].filter(Boolean)

		const failed = states.find((item) => item.state === 'FAILED')
		if (failed) {
			throw new Error(`Alexa build failed for ${failed.name}`)
		}

		const allSucceeded = states.every((item) => item.state === 'SUCCEEDED')
		if (allSucceeded) {
			console.log('Alexa skill build succeeded.')
			return
		}

		const summary = states
			.map((item) => `${item.name}=${item.state ?? 'UNKNOWN'}`)
			.join(', ')
		console.log(`[${attempt}/${MAX_POLL_ATTEMPTS}] ${summary}`)
		await sleep(POLL_INTERVAL_MS)
	}

	throw new Error('Timed out waiting for Alexa skill build to complete')
}

async function main() {
	const options = parseArgs(process.argv.slice(2))
	const skillId = await resolveSkillId(options.region)

	const modelPath = resolve(
		'skill-package',
		'interactionModels',
		'custom',
		`${options.locale}.json`,
	)
	JSON.parse(readFileSync(modelPath, 'utf8'))

	if (!options.modelOnly) {
		const lambdaArn = await resolveLambdaArn(options.stage, options.region)
		const manifestPath = resolve('skill-package', 'skill.json')
		const renderedManifest = renderManifest(manifestPath, lambdaArn)

		const tempDir = mkdtempSync(join(tmpdir(), 'ha-alexa-skill-'))
		const tempManifestPath = join(tempDir, 'skill.json')
		try {
			writeFileSync(tempManifestPath, renderedManifest, 'utf8')
			console.log(`Updating Alexa skill manifest (${options.alexaStage})...`)
			runAskSmapi(
				[
					'update-skill-manifest',
					'-s',
					skillId,
					'-g',
					options.alexaStage,
					'--manifest',
					`file:${tempManifestPath}`,
				],
				{ dryRun: options.dryRun },
			)
		} finally {
			rmSync(tempDir, { recursive: true, force: true })
		}
	}

	console.log(
		`Updating Alexa interaction model (${options.locale}, ${options.alexaStage})...`,
	)
	runAskSmapi(
		[
			'set-interaction-model',
			'-s',
			skillId,
			'-g',
			options.alexaStage,
			'-l',
			options.locale,
			'--interaction-model',
			`file:${modelPath}`,
		],
		{ dryRun: options.dryRun },
	)

	if (!options.dryRun) {
		await waitForSkillBuild(skillId, {
			locale: options.locale,
			checkManifest: !options.modelOnly,
		})
	}
}

main().catch((err) => {
	console.error(err.message)
	process.exit(1)
})
