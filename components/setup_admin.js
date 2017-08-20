
module.exports = (controller) => {
	const admin_user = process.env.admin_user
	
	controller.on('setupAdmin', (bot, message) => {
		bot.startPrivateConversation({user: admin_user, channel: admin_user}, (err, convo) => {
			convo.say(`Hello, creator! Please login with Trello and select your team's Trello Organization, here`)
		})
	})

	// controller.on('setupAdmin:success', (bot, message) => {
	  	
	// })
}
