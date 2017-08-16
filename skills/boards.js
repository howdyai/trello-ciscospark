
module.exports = (controller) => {


	// list all user boards
	controller.on('selectBoard', (bot, message) => {
		bot.trello.getBoards()
			.then(data => {
				const boardArray = data
				let boardList = data.map((el, i) => `\n\n**${i}:** ${el.name}`)
				boardList = boardList.join('')

				if (message.user === controller.identity.emails[0]) {
					// space joins will have bot identity as user, this works around that
					controller.api.people.get(message.original_message.actorId).then(identity => {
						console.log({identity})
						message.user = identity.emails[0]
						controller.trigger('selectBoard', [bot, message])
					})
				} else {
					bot.startConversation(message, (err, convo) => {

						convo.ask(`**Reply with a number from the list to set the default board for this Space.**\n\n*Hint: I can only hear you if you start your message with*  \`Trello\`\n\n${boardList}`, [
							{
								pattern: /^[\d]+$/,
								callback: (res, convo) => {
									if (boardArray[res.text]) {

										convo.say(`Setting this channel's board to [**${board.name}**](${board.url}), new cards will be added to **${board.lists[0].name}** list`)
										const board = boardArray[res.text]
										if (message.trelloChannel && message.trelloChannel.webhook) {
											// update current webhook with trello if it exists, so we dont have zombie webhooks
											bot.trello.updateWebhook(message, board)
										} else {
											// if no webhook exists for this channel, create one
											bot.trello.createWebhook(message, board)
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

				}
			})
	})
}

