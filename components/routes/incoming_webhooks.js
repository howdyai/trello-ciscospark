var debug = require('debug')('botkit:incoming_webhooks');

module.exports = function(webserver, controller) {

    debug('Configured POST /ciscospark/receive url for receiving events');
    webserver.post('/ciscospark/receive', function(req, res) {

        // NOTE: we should enforce the token check here

        // respond to Slack that the webhook has been received.
        res.status(200);
        res.send('ok');

        var bot = controller.spawn({});

        // Now, pass the webhook into be processed
        controller.handleWebhookPayload(req, res, bot);

    });

	webserver.post('/trello/receive', function(req, res) {
		console.log('======req body trello webhook:\n', req.body)
		res.status(200).send()
	})
	// respond with 200
	webserver.head('/trello/receive', function(req, res) {
		res.sendStatus(200)
	})
}
