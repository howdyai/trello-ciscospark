
module.exports = (controller) => {

	// Get user config, or prompt user to auth their trello account
	controller.middleware.receive.use((bot, message, next) => {
		if (message.user === controller.identity.emails[0]) {
			return
		} else {
			console.log({message})
			console.log('======RUNNING USER MIDDLEWARE')
			controller.storage.users.get(message.user, (err, user) => {
				if (! user) {
					controller.trigger('setupUser', [bot, message])
					return
				} else {
					message.trello_user = user
					console.log({user})
					next()
				}
			})
		}

	})

	// Get channel config, or prompt user to set up a board for the channel
	controller.middleware.receive.use((bot, message, next) => {
		console.log('=====RUNNING CHANNEL MIDDLEWARE')
		controller.storage.channels.get(message.channel, (err, channel) => {
			if (! channel) {
				bot.trello = controller.trelloActions.create(message.user)
				controller.trigger('setupChannel', [bot, message])
			} else {
				message.trello_channel = channel
				next()
			}
		})
	})

	// If user and board are set up, configure trello wrapper for their account
	controller.middleware.receive.use((bot, message, next) => {
		console.log('=====Setting up wrapper')
		bot.trello = controller.trelloActions.create(message.trello_user, message.trello_channel)
		next()
	})

	controller.on('setupChannel', (bot, message) => {
		controller.storage.channels.save({
			id: message.channel
		}, (err, channel) => {
			if (err) {
				console.log(err) 
			} else {
				controller.trigger('selectBoard', [bot, message])
			}
		})
	})


}




