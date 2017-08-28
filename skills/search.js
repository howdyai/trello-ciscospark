
module.exports = (controller) => {
	controller.on('searchBoard', (bot, message)=> {
		const query = message.match[1].trim()
		bot.trello.searchBoard(query).then(data => {
			console.log({data})
			const searchResults = data.cards.map((el, i) => {
				return {
					index: `${i + 1}`,
					display: `\n\n**${i + 1}:** ${el.name}`,
					id: el.id,
					name: el.name,
				}
			})
			const displayResults = searchResults.reduce((a,b,c) => `${a}\n\n**${b.index}:** ${b.name}`,'')

		bot.startConversation(message, (err, convo)=> {

					convo.ask(data.cards.length ? `**Search Results from [**${message.trello_channel.board.name}**](${message.trello_channel.board.url}) for query \`${query}\`:** ${displayResults}`: `No cards found that matched: \`${query}\` in board [**${message.trello_channel.board.name}**](${message.trello_channel.board.url})`, [
						{
							pattern: /^move ([\d]+)$/,
							callback: (res, convo)=> {
								console.log(data.cards)
								const match = res.text.match(/^move ([\d]+)$/)
								const card = searchResults.find(el => el.index === match[1])
								console.log({searchResults})
								console.log({card})
								if (card) {
									convo.setVar('card', card)
									const displayDestinations = message.trello_channel.board.lists.reduce((a, b, i) => `${a}\n\n**${b.index}:** ${b.name}`, '')

									convo.setVar('destinations', displayDestinations)
									convo.ask(`Where would you like to move it?\n\n{{vars.destinations}}`, [
										{
											pattern: /^[\d]+$/,
											callback: (res, convo) => {
												const list = message.trello_channel.board.lists.find(el => el.index === res.text)
												if (list) {
													console.log({card})
													console.log({list})
													bot.trello.moveCard(card.id, list.id)
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
		}).catch(function(err) {
				bot.reply(message,'An error occured: ' + err);
		});

	})
}
