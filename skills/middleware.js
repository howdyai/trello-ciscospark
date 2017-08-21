
module.exports = (controller) => {

	controller.middleware.receive.use((bot, message, next) => {

		bot.findConversation(message, function(convo) {
			if (convo) {
				message.in_convo = true;
			}
			next();
		});
	});

	controller.middleware.receive.use((bot, message, next) => {

		// ignore our own bots messages
		if (message.user === controller.identity.emails[0]) {
					return
				}
		controller.storage.teams.get('trello', (err, config) => {
			if (! config) {
				if (process.env.admin_user === message.user) {
					if (message.in_convo)  { return next(); }
					controller.trigger('setupTrello', [bot, message])
				} else {
					bot.reply(message, "Sorry, I'm waiting to be setup by the administrator")
				}
			} else {
				next()
			}
		})
	})

	// Get user config, or prompt user to auth their trello account
	controller.middleware.receive.use((bot, message, next) => {

		controller.storage.users.get(message.user, (err, user) => {
			if (! user) {
				if (message.in_convo)  { return next(); }
				controller.trigger('setupUser', [bot, message])
				return
			} else {
				message.trello_user = user
				next()
			}
		})


	})

	// Get channel config, or prompt user to set up a board for the channel
	controller.middleware.receive.use((bot, message, next) => {

		controller.storage.channels.get(message.channel, (err, channel) => {
			if (! channel) {

				bot.trello = controller.trelloActions.create(message.user)
				if (message.in_convo)  { return next(); }

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
		console.log('DEALING WITH MESSAGE:', message);
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
