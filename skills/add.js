
module.exports = (controller) => {

	controller.on('addCard', (bot, message) => {
		console.log({message})
			if (message.channel_config ){ //&& message.channel_config.list && message.channel_config.list.id) {

				bot.trello.addCard({
					name: message.match[1], 
					idList: channel.list.id
				})
			} else {
				bot.reply(message, 'Board settings are not right!')
				// user is not setup properly
			}
	})
}
