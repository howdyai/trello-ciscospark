
module.exports = (controller) => {

	// Get user config, or prompt user to auth their trello account
	controller.middleware.receive.use((bot, message, next) => {
		controller.storage.users.get(message,user, (err, user) => {
			if (! user) {
				controller.trigger('setupUser', [bot, message])
			} else {
				message.trello_user = user
				next()
			}
		})

	})

	// Get channel config, or prompt user to set up a board for the channel
	controller.middleware.receive.user((bot, message, next) => {
		controller.storage.channels.get(message.channel, (err, channel) => {
			if (! channel) {
				controller.trigger('selectBoard')
			} else {
				message.trello_channel = channel
				next()
			}
		})
	})

	// If user and board are set up, configure trello wrapper for their account
	controller.middleware.receive.use((bot, message, next) => {
		bot.trello = controller.trelloActions.create(user, channel)
		next()
	})

}




