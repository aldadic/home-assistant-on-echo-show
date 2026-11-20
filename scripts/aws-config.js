import { execFileSync } from 'node:child_process'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import {
	GetFunctionConfigurationCommand,
	LambdaClient,
} from '@aws-sdk/client-lambda'

export const LAMBDA_ARN_PLACEHOLDER = '__LAMBDA_ARN__'
export const SKILL_ID_SSM_PARAM = '/ha-assistant-skill/id'
export const SERVICE_NAME = 'ha-on-echo-show'
export const FUNCTION_NAME = 'ha-assistant-skill'

export const DEFAULT_REGION = 'us-east-1'

export function parseArgs(argv) {
	const options = {
		stage: 'dev',
		region: process.env.AWS_REGION || DEFAULT_REGION,
		locale: 'pt-BR',
		alexaStage: 'development',
		modelOnly: false,
		dryRun: false,
	}

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]
		if (arg === '--model-only') {
			options.modelOnly = true
		} else if (arg === '--dry-run') {
			options.dryRun = true
		} else if (arg === '--stage' && argv[i + 1]) {
			options.stage = argv[++i]
		} else if (arg === '--region' && argv[i + 1]) {
			options.region = argv[++i]
		} else if (arg === '--locale' && argv[i + 1]) {
			options.locale = argv[++i]
		} else if (arg === '--alexa-stage' && argv[i + 1]) {
			options.alexaStage = argv[++i]
		} else {
			throw new Error(`Unknown argument: ${arg}`)
		}
	}

	return options
}

export async function resolveSkillId(region = DEFAULT_REGION) {
	if (process.env.ALEXA_SKILL_ID) {
		return process.env.ALEXA_SKILL_ID
	}

	const ssm = new SSMClient({ region })
	const response = await ssm.send(
		new GetParameterCommand({
			Name: SKILL_ID_SSM_PARAM,
			WithDecryption: true,
		}),
	)

	const value = response.Parameter?.Value
	if (!value) {
		throw new Error(
			`Could not resolve Alexa Skill ID from SSM parameter ${SKILL_ID_SSM_PARAM}`,
		)
	}
	return value
}

export async function resolveLambdaArn(stage, region = DEFAULT_REGION) {
	if (process.env.LAMBDA_ARN) {
		return process.env.LAMBDA_ARN
	}

	const lambdaName = `${SERVICE_NAME}-${stage}-${FUNCTION_NAME}`
	const lambda = new LambdaClient({ region })
	const response = await lambda.send(
		new GetFunctionConfigurationCommand({
			FunctionName: lambdaName,
		}),
	)

	if (!response.FunctionArn) {
		throw new Error(`Could not resolve Lambda ARN for function ${lambdaName}`)
	}
	return response.FunctionArn
}

export function runAskSmapi(
	args,
	{ dryRun = false, captureOutput = false } = {},
) {
	if (dryRun) {
		console.log(`[dry-run] npx ask smapi ${args.join(' ')}`)
		return ''
	}

	return execFileSync('npx', ['ask', 'smapi', ...args], {
		encoding: 'utf8',
		stdio: captureOutput ? ['inherit', 'pipe', 'inherit'] : 'inherit',
	})
}
