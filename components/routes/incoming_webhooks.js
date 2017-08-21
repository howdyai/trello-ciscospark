var debug = require('debug')('botkit:incoming_webhooks');

const { inlineCard, displayCard } = require('../../helpers')
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
		// res.sendStatus(401)
		// return
		res.status(200).send()
		console.log('====INCOMING ACTION for board:', req.body.action.board)

		var bot = controller.spawn({})

		//@TODO put this into its own function
		const payload = req.body
		const action = payload.action
		const data = action.data
		const channel = {channel: req.query.channel}

		const userName = action.memberCreator.fullName
		let subject = action.memberCreator.fullName
		let actionText
		let dataText


			console.log({action})
		if (action.type === 'createCard') {
			actionText = '**created** a card'
			dataText = displayCard(data)
		}
		if (action.type === 'commentCard') {
			actionText = `**commented** on card ${inlineCard(data.card)}`
			dataText = `\n\n> "${action.data.text}"`

		}
		if (action.type === 'updateCard') {
			if (action.display.translationKey === 'action_move_card_from_list_to_list') {
				actionText = `**moved** ${inlineCard(data.card)}`
				dataText = `from list *${action.data.listBefore.name}* to list *${action.data.listAfter.name}*`
			}
			if (action.display.translationKey === 'action_archived_card') {
				actionText = `**archived** a card`
				dataText = displayCard(data)
			}

		}
		if (action.type === 'updateCheckItemStateOnCard') {
			if (action.display.translationKey === 'action_completed_checkitem') {
				subject = `Done: ${subject}`
				actionText = `completed ${action.data.checkItem.name}`
				dataText = ``
				bot.reply(channel, `${userName} updated **${action.data.checklist.name}** on card ["${action.data.card.name}"](http://www.trello.com/c/${action.data.card.shortLink})\n\n***Completed: "${action.data.checkItem.name}"***`)
			}
			if (action.display.translationKey === 'action_marked_checkitem_incomplete') {
				bot.reply(channel, `${userName} updated **${action.data.checklist.name}** on card ["${action.data.card.name}"](http://www.trello.com/c/${action.data.card.shortLink})\n\n***Incomplete: "${action.data.checkItem.name}"***`)
			}
		}
		const multiLine = dataText.split('\n\n').length > 1

		bot.reply(channel, `${multiLine ? '' : '> '}${subject} ${actionText} ${dataText}`)

	})
	// respond with 200 when setting up trello webhook
	webserver.head('/trello/receive', function(req, res) {
		res.sendStatus(200)
	})
}
