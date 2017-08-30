
module.exports = (controller) => {

	controller.on('user_space_join', (bot, message) => {
		controller.channels.get(message.channel, (err, channel) => {
			if (channel) {
				bot.reply(message, `Welcome! Currently this channel is set up to receive alerts from, and interact with, the trello board [${channel.board.name}](${channel.board.url}) from this channel. Send me \`help\` to see  list of available commands.`)
			}
		})
	})

	controller.on('bot_space_join', (bot, message) => {
		controller.storage.channels.get(message.channel, function(err, channel) {
				// space joins will have bot identity as user, this works around that
				controller.api.people.get(message.original_message.actorId).then(identity => {
					message.user = identity.emails[0]

					bot.reply(message, 'Thanks for inviting me! To start using Trello here, assign a board to this Space')
					controller.storage.config.get().then(config => {
						console.log('====creating actions with no token')
						bot.trello = controller.trelloactions.create({config: trello})
						console.log('=====triggering select board')
						controller.trigger('selectboard', [bot, message])

					})
					.catch(err => controller.error('Error getting config.json data'))

				})
			}
		
		)
	})

	controller.on('bot_space_leave', (bot, message) => {
		console.log({message})
		controller.storage.channels.get(message.channel, (err, channel) => {
			if (channel && channel.webhook) {
				console.log('===Deleting channel record')
				controller.storage.channels.delete(message.channel, function(err, res) {
					if (err) console.log('err deleting channel record', err)
				})
			
			} else console.log('==== No Channel record found')
		})
	})

}
