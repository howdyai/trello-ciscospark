
module.exports = (controller) => {

	// list all user boards
	controller.on('selectBoard', (bot, message) => {
		bot.trello.getBoards()
			.then(data => {
				if (data.length) {
				const boards = data.map((el, i) => {
					return {
						index: `${i + 1}`,
						display: `\n\n**${i + 1}:** ${el.name}`,
						url: el.url,
						id: el.id,
						name: el.name,
						lists: el.lists
					}
				})
					const displayBoards = boards.reduce((a,b,c) => `${a}\n\n**${b.index}:** ${b.name}`,'')

						bot.createConversation(message, (err, convo) => {
							convo.addMessage("Okay! You're all set to receive alerts here from Trello board [{{vars.board.name}}]({{vars.board.url}}). If no list is specified when adding a card, cards will be added to the list {{vars.list.name}}", 'confirm')

							convo.addQuestion(`**Reply with a number from the list to set the default board for this Space.**\n\n*Hint: I can only hear you if you start your message with*  \`${controller.identity.displayName}\`\n\n${displayBoards}`, [
								{
									pattern: /^[\d]+$/,
									callback: (res, convo) => {
										const board = boards.find(el => el.index == res.text)
										if (board) {
											const lists = board.lists.map((el, i) => {
												return {
													index: `${i + 1}`,
													display: `\n\n**${i + 1}:** ${el.name}`,
													id: el.id,
													name: el.name,
												}
											})
											board.lists = lists
											convo.setVar('board', board)
											if (! board.lists.length) {
												convo.say("**Looks like [**{{vars.board.name}}**]({{vars.board.url}}) doesn't have any lists yet. Create a list on the board and try setting it up again**")
												convo.next()
											} else {
												convo.say(`**Heard! You selected board [**{{vars.board.name}}**]({{vars.board.url}})**`)

												convo.setVar('lists', lists)
												convo.setVar('displayList', lists.reduce((a,b,c) => `${a}\n\n**${b.index}:** ${b.name}`,''))
												const displayList = lists.reduce((a,b,c) => `${a}\n\n**${b.index}:** ${b.name}`,'')

												convo.gotoThread('setList')
											}
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
							convo.addQuestion(`**Choose the default list to use when adding cards to {{vars.board.name}}** \n\n**Reply with a number from the list** {{vars.displayList}}`, [
								{
									pattern: /^[\d]+$/,
									callback: (res, convo) => {
										const list = convo.vars.lists.find(el => el.index == res.text)
										if (list) {
											convo.setVar('list', list)
											convo.say(`**New cards will be added to **{{vars.list.name}}**`)
											if (message.trello_channel && message.trello_channel.webhook) {
												// update current webhook with trello if it exists, so we dont have zombie webhooks
												bot.trello.updateBoardWebhook({
													webhook: message.trello_channel.webhook,
													boardId: convo.vars.board.id,
													listId: list.id,
													channel: message.channel,
												}).then(data => {

													controller.storage.channels.save({
														id: message.channel,
														board: convo.vars.board,
														list: list,
														webhook: data
													}, (err, channel) => {
														controller.debug('UPDATED CHANNEL:', channel)
														convo.gotoThread('confirm')
													})
												}).catch(err => console.err(err))
											} else {
												// if no webhook exists for this channel, create one
												bot.trello.registerBoardWebhook({
													boardId: convo.vars.board.id,
													channel: message.channel
												}).then(webhook => {
													controller.storage.channels.save({
														id: message.channel,
														board: convo.vars.board,
														list: list,
														webhook: webhook
													}, (err, channel) => {
														if (err) controller.log('Error saving webhook for channel', err)

														else {
															controller.debug('SAVED CHANNEL: ', channel)
															convo.gotoThread('confirm')
														}
													})
												}).catch(err => controller.log(`Error registering trello webhook for channel ${message.channel}`, err.message))
											}

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
							], {}, 'setList')
						convo.activate()
						})


				} else {
					bot.reply(message, "**There are no open boards available in your organization, please add a board on Trello**")

				}
			})
		})
}


