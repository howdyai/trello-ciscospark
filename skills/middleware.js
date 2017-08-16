
module.exports = (controller) => {


     controller.middleware.receive.use((bot, message, next) => {
		 console.log('=======RECEIVE MIDDLEWARE FIRED')
		controller.storage.users.get(message.user, (err, user) => {
			console.log({message})

			if (err) {// there is an error if the user isnt in the db
				// okay it looks like I'm not getting out of here until at least I setup a non-found user and pass it on message to next
				console.log('Err getting user from storage: ', err)
			} if (! user) {

				setupUser(message, (err, user) => {
					console.log('=====NEW USER:\n', user)
					if (err) next(err)
					else next()
				})
			} else {
				console.log('Have user, looking for channel')
				controller.storage.channels.get(message.channel, (err, channel) => {
					if (err) {
						console.log('Err getting channel from storage: ', err)
						// controller.trigger('selectBoard', [bot, message])
					} 
					message.channel_config = channel 
					// pass in user and channel so our actions are fully configured
					// create trello api wrapper, requires a trello token
					// add all our trello functions to the bot object

					bot.trello = controller.trelloActions.create(user, channel)
					console.log('======BOT.TRELLO IN MIDDLEWARE', bot.trello)
					next();
				})

			}

			})
	 function setupUser(message, cb) {
	 console.log('======HEARD SETUP USER')
	 const userObj = {
		 id: message.user,
		 token: '',
		 first_name: '',
		 last_name: '', 
		 email: ''
	 }

	 controller.storage.users.save(userObj, (err, user) => {
		 if (err) console.log('Error saving user:', err)
		 else console.log({user})

	 controller.storage.channels.get(message.channel, (err, channel) => {
		 if (err) {
			 console.log('Err getting channel from storage: ', err)
		 }

			 message.channel_config = channel 
			 // pass in user and channel so our actions are fully configured
			 // create trello api wrapper, requires a trello token
			 // add all our trello functions to the bot object
			 bot.trello = controller.trelloActions.create(user, channel)
			 cb && cb(null, user)
		 }
	 )
	 })

	 }
     });
    
}




