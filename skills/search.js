
module.exports = (controller) => {
	controller.on('searchBoard', (bot, message)=> {
				const query = message.match[1].trim()

				t.get('1/search', {
					query: query,
					modelTypes: 'cards',
					idBoards: message.trelloChannel.board.id,
					card_fields: 'name,desc,due,subscribed',
					card_list: true,
					partial: true
				},
					(err, data) => {
				if (err) {
					console.log('err:', err)
					bot.reply(message, 'Something has gone wrong')
				} else {
					console.log({data})
					console.log(data.cards[0])
					let searchResults = data.cards.map((el, i) => `\n\n**${i}:** "${el.name}" in *${el.list.name}*`)
							.join('')
					bot.startConversation(message, (err, convo)=> {

						convo.ask(data.cards.length ? `**Search Results from [**${message.trelloChannel.board.name}**](${message.trelloChannel.board.url}) for query \`${query}\`:** ${searchResults}`: `No cards found that matched: \`${query}\` in board [**${message.trelloChannel.board.name}**](${message.trelloChannel.board.url})`, [
							{
								pattern: /^move ([\d]+)$/,
								callback: (res, convo)=> {
									if (data.cards[res.match[1]]) {
										const destinations = channel.board.lists.reduce((a, b, i) => a.concat(`\n\n**${i}:** ${b.name}`), '')//
										convo.setVar('card', data.cards[res.match[1]])
										console.log({destinations})
										convo.ask(`Where would you like to move it?\n\n${destinations}`, [
											{
												pattern: /^[\d]+$/,
												callback: (res, convo) => {
													if (channel.board.lists[res.text]) {
														t.put(`1/cards/${convo.vars.card.id}`, {idList: channel.board.lists[res.text].id}, (err, data) => {
															if (err) {
																console.log({err})
															}													
														})
														convo.stop()
													} else {
														convo.repeat()
													}
													
												}
											}, {
												default: true,
												callback: (res, convo) => {
													convo.say('Please select a list, or say \`cancel\`')
													// convo.silentRepeat()
													convo.repeat()
												}
											}
										])
										convo.next()
									}
								}
							},
							// this is a hack, but allows having an open ended convo, and nesting commands
							// if no chainable commands heard after search, bail from the convo and run the text through hears
							{
								default: true,
								callback: (res, convo)=> {
									convo.stop()
									controller.receiveMessage(bot, res)
								}
							}
						])
						// convo.next()
					})
				}
				})

	})
}
