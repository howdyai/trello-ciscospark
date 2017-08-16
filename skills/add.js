
module.exports = (controller) => {

	controller.hears(['^add (.*)'], 'direct_message, direct_mention', (bot, message) => {
		console.log({message})
		console.log(message.channel)
			if (message.trelloChannel&& message.trelloChannel.list && message.trelloChannel.list.id) {
				t.post('/1/cards/', {
					name: message.match[1], 
					idList: channel.list.id
				}, 
					(err, data) => {
						if (err) {
							console.log('err:', err)
							bot.reply(message, 'Something has gone wrong')
						} else {
							console.log('Made that card')

						}

				})
			}
	})
}
