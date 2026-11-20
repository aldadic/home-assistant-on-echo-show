// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
import { LaunchRequestHandler } from './src/intents/launchRequestHandler.js'
import { HelpIntentHandler } from './src/intents/helpIntentHandler.js'
import { OpenPageIntentHandler } from './src/intents/openPageIntentHandler.js'
import { CancelAndStopIntentHandler } from './src/intents/cancelAndStopIntentHandler.js'
import { FallbackIntentHandler } from './src/intents/fallbackIntentHandler.js'
import { SessionEndedRequestHandler } from './src/sessionEndedRequestHandler.js'
import { ErrorHandler } from './src/errorHandler.js'

import Alexa from 'ask-sdk-core'

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
const skill = Alexa.SkillBuilders.custom()
	.addRequestHandlers(
		LaunchRequestHandler,
		OpenPageIntentHandler,
		HelpIntentHandler,
		CancelAndStopIntentHandler,
		SessionEndedRequestHandler,
		FallbackIntentHandler,
	)
	.addErrorHandlers(ErrorHandler)
	.withApiClient(new Alexa.DefaultApiClient())
	.create()

export const handler = async (event, context) => skill.invoke(event, context)
