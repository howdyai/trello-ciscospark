
module.exports = (controller) => {

	// list all user boards
	controller.on('selectBoard', (bot, message) => {
		if (message.user === controller.identity.emails[0]) {
			console.log({message})
					// space joins will have bot identity as user, this works around that
					controller.api.people.get(message.original_message.actorId).then(identity => {
						console.log({identity})
						console.log('=====CONVERTING BOT JOIN USER FIED TO:', identity.emails[0])
						message.user = identity.emails[0]
						controller.trigger('selectBoard', [bot, message])
						return
					})
				} else {

		bot.trello.getBoards()
			.then(data => {
				const boardArray = data
				const boardList = data.map((el, i) => `\n\n**${i}:** ${el.name}`).join('')
				// boardList = boardList.join('')
				console.log({message})

					bot.startConversation(message, (err, convo) => {

						convo.ask(`**Reply with a number from the list to set the default board for this Space.**\n\n*Hint: I can only hear you if you start your message with*  \`Trello\`\n\n${boardList}`, [
							{
								pattern: /^[\d]+$/,
								callback: (res, convo) => {
									if (boardArray[res.text]) {

										const board = boardArray[res.text]

										convo.say(`Setting this channel's board to [**${board.name}**](${board.url}), new cards will be added to **${board.lists[0].name}** list`)
										if (message.trello_channel && message.trello_channel.webhook) {
											// update current webhook with trello if it exists, so we dont have zombie webhooks
											bot.trello.updateBoardWebhook({
												webhookId: message.trello_channel.webhook.id,
												boardId: board.id,
												channel: message.channel
											}).then(data => {

												controller.storage.channels.save({
													id: message.channel,
													board: board,
													list: board.lists[0],
													webhook: data
												})
											}).catch(err => console.log(err))
										} else {
											// if no webhook exists for this channel, create one
											bot.trello.registerBoardWebhook({
												boardId: board.id,
												channel: message.channel
											}).then(data => {
												controller.storage.channels.save({
													id: message.channel,
													board: board,
													list: board.lists[0],
													webhook: data
												}, (err, channel) => {
													if (err) console.log('=======ERROR SAVING')
													else console.log('========SAVED CHANNEL: ', channel)
												})
											}).catch(err => console.log(err))
										}
										convo.next()
									} else {
										convo.repeat()
										convo.next()
									}
								}
							},
							{
								default: true,
								callback: (res, convo) => {
									convo.repeat()
									convo.next()
								}
							}
						])
					convo.next()
					})

				})
			}})
}


