
module.exports = (controller) => {

	// goal, setup new user who isnt in the DB already
	controller.on('setupUser', (bot, message) => {
		console.log('====Setup user handler')
		console.log({message})
		bot.reply(message, `Login first with your trello account [here](${process.env.public_address}/login?user=${message.user}&channel=${message.channel})`)
	})

	controller.on('oauthSuccess', (bot, data) => {

		// grab user trello profile?
		// where does the wrapper come into play then?

		const userObj = {
			id: data.user,
			token: data.token, 
			trello_id: '',
			first_name: '',
			last_name: '', 
			email: ''
		}
		console.log({data})

		controller.storage.users.save(userObj, (err, user) => {
			if (err) {
				console.log(err)
			} else {
				console.log('======SETUP USER SUCCESS')
				bot.reply({channel: data.channel}, "All set up! Here's help text")

			}

		})
	})
}
