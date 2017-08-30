
const config = require('../components/config.js')

module.exports = (controller) => {

	controller.middleware.receive.use((bot, message, next) => {

		// ignore our own bots messages //@TODO this doesnt really belong here
		if (message.user === controller.identity.emails[0]) {
			console.log('ignoring a message from' + controller.identity.emails[0])
			console.log({message})
					return
				} 
		bot.findConversation(message, function(convo) {
			if (convo) {
				message.in_convo = true;
			}
			next();
		});
	});	

	controller.middleware.receive.use((bot, message, next) => {
		// I want to replace getting global config data from the botkit storage with a simple config.json file
		// trelloConfig.get().then(config => {})
		// trelloConfig.save().then(config => {})
		// controller.storage.teams.get('trello', (err, config) => {
		// 	if (! config) {
		// 		console.log('====NO CONFIG FOUND IN MIDDLEWARE, TRIGGERING SETUP')
		// 		if (message.in_convo) {
		// 			return next()
		// 		} 
		// 		if (process.env.admin_user === message.user) {
		// 			if (message.in_convo)  { return next(); }
		// 			controller.trigger('setupTrello', [bot, message])
		// 		} else {
		// 			bot.reply(message, "Sorry, I'm waiting to be setup by the administrator")
		// 		}
		// 	} else {
		// 		message.trello_config = config
		// 		next()
		// 	}
		// })
		config.get().then(config => {
			console.log({config})
		}).catch(err => console.log({err}))
	})

	// Get user config, or prompt user to auth their trello account
	controller.middleware.receive.use((bot, message, next) => {

		controller.storage.users.get(message.user, (err, user) => {
			if (! user) {
				if (message.in_convo) {
					return next()
				} 
				controller.debug('=====No user record found, triggering setupUser')
				controller.trigger('setupUser', [bot, message])
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
				if (message.in_convo) {
					return next()
				} 
				controller.debug('No channel set up')
				bot.trello = controller.trelloActions.create({config: message.trello_config, user: message.trello_user})
				controller.trigger('selectBoard', [bot, message])

			} else {
				message.trello_channel = channel
				next()
			}
		})
	})

	// If user and board are set up, configure trello wrapper for their account
	controller.middleware.receive.use((bot, message, next) => {
		if (message.in_convo) {
			return next()
		} 
		console.log({message})
		bot.trello = controller.trelloActions.create({config: message.trello_config, user: message.trello_user, channel: message.trello_channel})
		next()
	})


}
