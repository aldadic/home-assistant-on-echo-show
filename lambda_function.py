import json
import logging
import ask_sdk_core.utils as ask_utils
from ask_sdk_core.skill_builder import SkillBuilder
from ask_sdk_core.dispatch_components import AbstractRequestHandler
from ask_sdk_core.dispatch_components import AbstractExceptionHandler
from ask_sdk_core.handler_input import HandlerInput
from ask_sdk_model.interfaces.alexa.presentation.apl import RenderDocumentDirective, ExecuteCommandsDirective, OpenUrlCommand
from ask_sdk_model import Response
from typing import Dict, Any

#################### Change this ########################

DASHBOARD_URL = "http://homeassistant.local:8123/echo-show/"
KIOSK_MODE = True

#########################################################

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
TOKEN = "someToken"

def open_page(number):
    if KIOSK_MODE:
        source = DASHBOARD_URL + str(number) + "?kiosk"
    else:
        source = DASHBOARD_URL + str(number)
    return OpenUrlCommand(
        source = source
    )


def _load_apl_document(file_path):
    # type: (str) -> Dict[str, Any]
    """Load the apl json document at the path into a dict object."""
    with open(file_path) as f:
        return json.load(f)


class LaunchRequestHandler(AbstractRequestHandler):
    """Handler for Skill Launch."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool

        return ask_utils.is_request_type("LaunchRequest")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response

        response_builder = handler_input.response_builder

        # Render empty template, needed for OpenURL command
        # see https://amazon.developer.forums.answerhub.com/questions/220506/alexa-open-a-browser.html
        response_builder.add_directive(
            RenderDocumentDirective(
                token=TOKEN,
                document=_load_apl_document("template.json")
            )
        )

        # Open default page of dashboard
        response_builder.add_directive(
            ExecuteCommandsDirective(
                token=TOKEN,
                commands=[open_page("")]
            )
        )
        
        return response_builder.response


class OpenPageIntentHandler(AbstractRequestHandler):
    """Handler for Open Page Intent."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_intent_name("OpenPageIntent")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response

        response_builder = handler_input.response_builder
        number = ask_utils.request_util.get_slot(handler_input, "page").value

        # Render empty template, needed for OpenURL command
        # see https://amazon.developer.forums.answerhub.com/questions/220506/alexa-open-a-browser.html
        response_builder.add_directive(
            RenderDocumentDirective(
                token=TOKEN,
                document=_load_apl_document("template.json")
            )
        )

        # Open respective page of dashboard
        response_builder.add_directive(
            ExecuteCommandsDirective(
                token=TOKEN,
                commands=[open_page(number)]
            )
        )
        
        return response_builder.response


class HelpIntentHandler(AbstractRequestHandler):
    """Handler for Help Intent."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_intent_name("AMAZON.HelpIntent")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response

        return (
            handler_input.response_builder
                .response
        )


class CancelOrStopIntentHandler(AbstractRequestHandler):
    """Single handler for Cancel and Stop Intent."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return (ask_utils.is_intent_name("AMAZON.CancelIntent")(handler_input) or
                ask_utils.is_intent_name("AMAZON.StopIntent")(handler_input))

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response

        return (
            handler_input.response_builder
                .response
        )


class SessionEndedRequestHandler(AbstractRequestHandler):
    """Handler for Session End."""
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_request_type("SessionEndedRequest")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response

        # Any cleanup logic goes here.

        return handler_input.response_builder.response


class IntentReflectorHandler(AbstractRequestHandler):
    """The intent reflector is used for interaction model testing and debugging.
    It will simply repeat the intent the user said. You can create custom handlers
    for your intents by defining them above, then also adding them to the request
    handler chain below.
    """
    def can_handle(self, handler_input):
        # type: (HandlerInput) -> bool
        return ask_utils.is_request_type("IntentRequest")(handler_input)

    def handle(self, handler_input):
        # type: (HandlerInput) -> Response
        intent_name = ask_utils.get_intent_name(handler_input)
        speak_output = "You just triggered " + intent_name + "."

        return (
            handler_input.response_builder
                .speak(speak_output)
                # .ask("add a reprompt if you want to keep the session open for the user to respond")
                .response
        )


class CatchAllExceptionHandler(AbstractExceptionHandler):
    """Generic error handling to capture any syntax or routing errors. If you receive an error
    stating the request handler chain is not found, you have not implemented a handler for
    the intent being invoked or included it in the skill builder below.
    """
    def can_handle(self, handler_input, exception):
        # type: (HandlerInput, Exception) -> bool
        return True

    def handle(self, handler_input, exception):
        # type: (HandlerInput, Exception) -> Response
        logger.error(exception, exc_info=True)

        speak_output = "An error has occured."

        return (
            handler_input.response_builder
                .speak(speak_output)
                .response
        )

# The SkillBuilder object acts as the entry point for your skill, routing all request and response
# payloads to the handlers above. Make sure any new handlers or interceptors you've
# defined are included below. The order matters - they're processed top to bottom.


sb = SkillBuilder()

sb.add_request_handler(LaunchRequestHandler())
sb.add_request_handler(OpenPageIntentHandler())
sb.add_request_handler(HelpIntentHandler())
sb.add_request_handler(CancelOrStopIntentHandler())
sb.add_request_handler(SessionEndedRequestHandler())
sb.add_request_handler(IntentReflectorHandler()) # make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers

sb.add_exception_handler(CatchAllExceptionHandler())

lambda_handler = sb.lambda_handler()