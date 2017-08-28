
module.exports = (controller) => {

	controller.on('user_space_join', (bot, message) => {
		controller.channels.get(message.channel, (err, channel) => {
			if (channel) {
				bot.reply(message, `Welcome! Currently this channel is set up to receive alerts from, and interact with, the trello board [${channel.board.name}](${channel.board.url}) from this channel. Send me \`help\` to see  list of available commands.`)
			}
		})
	})

	controller.on('bot_space_join', (bot, message) => {
		// what middleware includes listeners?
		console.log('====Bot Space Join')
		console.log({message})
		controller.storage.channels.get(message.channel, function(err, channel) {
				// space joins will have bot identity as user, this works around that
				controller.api.people.get(message.original_message.actorId).then(identity => {
					message.user = identity.emails[0]

					bot.reply(message, 'Thanks for inviting me! To start using Trello here, assign a board to this Space')
					controller.storage.teams.get('trello', (err, trello) => {
						if (err) {
							console.log(err)
						} else {
							console.log('====CREATING ACTIONS WITH NO TOKEN')
							bot.trello = controller.trelloActions.create({config: trello})
							controller.trigger('selectBoard', [bot, message])
						}
					})
					

				})
			}
		
		)
	})

	controller.on('bot_space_leave', (bot, message) => {
		console.log({message})
		controller.storage.channels.get(message.channel, (err, channel) => {
			if (channel && channel.webhook) {
			controller.storage.teams.get('trello', (err, trello) => {
				if (trello) {
					console.log('====CREATING ACTIONS WITH NO TOKEN')
				bot.trello = controller.trelloActions.create({config: trello})
				bot.trello.del(`/1/webhooks/${message.channel_config.webhook.id}`, function(err, data) {
					if (err) console.log('Error deleting webhook')
					else console.log({data})
				})
				controller.storage.channels.delete(message.channel, function(err, res) {
					if (err) console.log('err deleting channel record', err)
				})
			} else console.log('==== No Channel record found')
		})
			}
	})
	})

}
