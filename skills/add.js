
module.exports = (controller) => {

	controller.on('addCard', (bot, message) => {

			if (message.trelloChannel && message.trelloChannel.list && message.trelloChannel.list.id) {

				bot.trello.addCard({
					name: message.match[1], 
					idList: channel.list.id
				})
			} else {
				// user is not setup properly
			}
	})
}
