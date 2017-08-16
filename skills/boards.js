
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
										console.log({boardList})
									const board = boardArray[res.text]
									// set the channel board default, what about list default?
									console.log({board})
										console.log({message})
										convo.say(`Setting this channel's board to [**${board.name}**](${board.url}), new cards will be added to **${board.lists[0].name}** list`)
										convo.next()
										
										// create/update webhook for channel
										// if webhook exists for this channel, update it
										console.log({message})
										if (message.trelloChannel && message.trelloChannel.webhook) {
											console.log('====Updating trello webhook')
											t.put('1/webhooks/' + message.trelloChannel.webhook.id, { idModel: board.id, callbackURL: `${process.env.public_address}/trello/receive?channel=${message.channel}` }, (err, data) => {
												if (err) {
													console.log('Error updating webhook: ', err)
												} else {
													controller.storage.channels.save({
														id: message.channel,
														board: board,
														list: board.lists[0],
														webhook: data
													})
													console.log({data})
												}
											})

										} else {
											console.log('=======CREATING NEW WEBHOOK')
											// if no webhook exists for this channel, create one
											t.post('1/webhooks', {idModel: board.id, callbackURL: `${process.env.public_address}/trello/receive?channel=${message.channel}`}, (err, data) => {
												if (err) {
													console.log('Error setting up webhook: ', err)
												} else {
													controller.storage.channels.save({
														id: message.channel,
														board: board,
														list: board.lists[0],
														webhook: data
													}, (err, res) => {
														if (err) console.log({err})
														console.log('====Created new webhook successfully:\n', data)
													})
												}
											})
										}

									} else {
										// silentRepeat was ending my convo before
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

