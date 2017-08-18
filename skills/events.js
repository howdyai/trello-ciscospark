
module.exports = (controller) => {

	controller.on('bot_space_join', (bot, message) => {
		// what middleware includes listeners?
		console.log({message})
		controller.storage.channels.get(message.channel, function(err, channel) {

			if (message.user === controller.identity.emails[0]) {
					// space joins will have bot identity as user, this works around that
					controller.api.people.get(message.original_message.actorId).then(identity => {
						console.log({identity})

						message.user = identity.emails[0]
						bot.reply(message, 'Thanks for inviting me! To start using Trello here, assign a board to this Space')

						message.text = 'boards'
						console.log('======TO BE RCVD"\n', message)

						controller.receiveMessage(bot, message)
					})
				}

			controller.trigger('selectBoard', [bot, message])
		
		})
	})

	controller.on('bot_space_leave', (bot, message) => {
		controller.storage.channels.get(message.channel, (err, channel) => {
			if (channel && channel.webhook) {
				t.del(`/1/webhooks/${message.channel_config.webhook.id}`, function(err, data) {
					if (err) console.log('Error deleting webhook')
					else console.log({data})
				})
				controller.storage.channels.delete(message.channel, function(err, res) {
					if (err) console.log('err deleting channel record', err)
				})
			} else console.log('==== No Channel record found')
		})
	})

}
