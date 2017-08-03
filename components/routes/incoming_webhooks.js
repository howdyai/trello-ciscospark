var debug = require('debug')('botkit:incoming_webhooks');

module.exports = function(webserver, controller) {

    debug('Configured POST /ciscospark/receive url for receiving events');
    webserver.post('/ciscospark/receive', function(req, res) {

        // NOTE: we should enforce the token check here

        // respond to Slack that the webhook has been received.
        res.status(200);
        res.send('ok');

        var bot = controller.spawn({});

        // Now, pass the webhook in to be processed
        controller.handleWebhookPayload(req, res, bot);

    });

	webserver.post('/trello/receive', function(req, res) {
		//@TODO put this into its own function
		if (req.query) {
			console.log('====QS PASSED FROM TRELLO\n',req.query)
		}
		res.status(200).send()
		console.log(req.body)

		var bot = controller.spawn({})
		// I need to get the channel to push this alert into
		const payload = req.body
		const action = payload.action
		const channel = {channel: req.query.channel}

		if (action.type === 'createCard') {

			bot.reply(channel, `${action.memberCreator.fullName} created card in list **${action.data.list.name}** on board ${action.data.board.name}`)
		}
		if (action.type === 'commentCard') {

			bot.reply(channel, 'Someone commented on a card!')
		}
		if (action.type === 'updateCard') {
			if (action.display.translationKey === 'action_move_card_from_list_to_list') {
				bot.reply(channel, 'Someone moved a card!')
			}

		}

	})
	// respond with 200 when setting up trello webhook
	webserver.head('/trello/receive', function(req, res) {
		res.sendStatus(200)
	})
}
