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
		res.status(200).send()
		console.log('====INCOMING ACTION\n', req.body.action)

		var bot = controller.spawn({})

		//@TODO put this into its own function
		const payload = req.body
		const action = payload.action
		const channel = {channel: req.query.channel}

		if (action.type === 'createCard') {

			bot.reply(channel, `${action.memberCreator.fullName} **created** card *"[**${action.data.card.name}**](http://www.trello.com/c/${action.data.card.shortLink})"*  in list **${action.data.list.name}** on board [**${action.data.board.name}**](${action.data.board.url})`)

		}
		if (action.type === 'commentCard') {

			bot.reply(channel, `${action.memberCreator.fullName} **commented** *"${action.data.text}"* on card ["${action.data.card.name}"](http://www.trello.com/c/${action.data.card.shortLink}) on board ${action.data.board.name}`)
		}
		if (action.type === 'updateCard') {
			if (action.display.translationKey === 'action_move_card_from_list_to_list') {
				
				bot.reply(channel, `${action.memberCreator.fullName} **moved** card ["${action.data.card.name}"](http://www.trello.com/c/${action.data.card.shortLink}) from *${action.data.listBefore.name}* to *${action.data.listAfter.name}* on board **${action.data.board.name}**`)

			}
			if (action.display.translationKey === 'action_archived_card') {

				bot.reply(channel, `${action.memberCreator.fullName} **archived** card ["${action.data.card.name}"](http://www.trello.com/c/${action.data.card.shortLink}) on list *${action.data.list.name}* on board **${action.data.board.name}**`)
			}

		}

	})
	// respond with 200 when setting up trello webhook
	webserver.head('/trello/receive', function(req, res) {
		res.sendStatus(200)
	})
}
