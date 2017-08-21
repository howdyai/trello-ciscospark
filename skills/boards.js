
module.exports = (controller) => {

	// list all user boards
	controller.on('selectBoard', (bot, message) => {
		console.log('===SELECT BOARD')
		bot.trello.getBoards()
			.then(data => {
				const boardArray = data
				const boardList = data.map((el, i) => `\n\n**${i}:** ${el.name}`).join('')
				// boardList = boardList.join('')

					bot.startConversation(message, (err, convo) => {

						convo.ask(`**Reply with a number from the list to set the default board for this Space.**\n\n*Hint: I can only hear you if you start your message with*  \`Trello\`\n\n${boardList}`, [
							{
								pattern: /^[\d]+$/,
								callback: (res, convo) => {
									console.log({res})
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
											console.log('======CREATE NEW WEBHOOK')
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
									console.log('======NO MATCH CONVO REPEATING')
									convo.repeat()
									convo.next()
								}
							}
						])
					convo.next()
					})

				})
			})
}


