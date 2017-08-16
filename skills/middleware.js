module.exports = (controller) => {

     controller.middleware.receive.use((bot, message, next) => {
		controller.storage.users.get(message.user, (err, user) => {

			if (err) {
				console.log('Err getting user from storage: ', err)
				next(err)
			} else if (! user) {
				controller.trigger('setupUser', [bot, message])
				next()
			} else {
				controller.storage.channels.get(message.channel, (err, channel) => {
					if (err) {
						console.log('Err getting channel from storage: ', err)
						next(err)
					} else if (! channel) {
						controller.trigger('selectBoard', [bot, message])
						next()
					} else {

						message.channel_config = channel 
						// pass in user and channel so our actions are fully configured
						bot.trello = trelloActions.create(user, channel)//new Trello(process.env.T_KEY, process.env.T_TOKEN)
						next();
					}
				})

			}

			})
     });
    
}
