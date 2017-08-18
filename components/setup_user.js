
module.exports = (controller) => {

	// goal, setup new user who isnt in the DB already
	controller.on('setupUser', (bot, message) => {

		bot.reply(message, "Login first with your trello account. Please follow the link")

		// user setup will require oauth login w/ trello
		// send user to login, get credentials via webhook, persist them to db
		const userObj = {
			id: message.user,
			token: '',
			first_name: '',
			last_name: '', 
			email: ''
		}

		controller.storage.users.save(userObj, (err, user) => {
			if (err) {
				console.log(err)
			} else {
				bot.reply(message, 'All set up!')

			}

		})
	})
}
