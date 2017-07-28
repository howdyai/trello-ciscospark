var debug = require('debug')('botkit:incoming_webhooks');

module.exports = function(webserver, controller) {

    debug('Configured POST /ciscospark/receive url for receiving events');
    webserver.post('/ciscospark/receive', function(req, res) {

        // NOTE: we should enforce the token check here

        // respond to Slack that the webhook has been received.
        res.status(200);
        res.send('ok');

        var bot = controller.spawn({});

		bot.startConversationWithPersonId = function(message, cb) {
			var personId = message.original_message.actorId
			controller.api.people.get(personId).then(function(identity) {
				console.log({identity})
					bot.startConversation({user: identity.emails[0], channel: message.channel}, cb);
				}).catch(function(err) {
					cb(err);
				});	
		}
		bot.startConversationWithActor = function(message, cb) {
			bot.startConversationWithPersonId(message, cb)
		}

        // Now, pass the webhook into be processed
        controller.handleWebhookPayload(req, res, bot);

    });

}
