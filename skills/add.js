
module.exports = (controller) => {

	controller.on('addCard', (bot, message) => {
		console.log({message})
			if (message.trello_channel){ 
				// listId will be optional
				const listId = undefined//message.trello_channel.list.id
				const title = message.match[1] // minus the list if given

				bot.trello.addCard(title)
					.catch(err => {
						bot.reply('Something went wrong')
						console.log(err)
					})
				
			} else {
				bot.reply(message, 'Board settings are not right!')
				// user is not setup properly
			}
	})
}
