
module.exports = (controller) => {

	controller.on('addCard', (bot, message) => {
		console.log('====MESSAGE IN addCard', message)
		// so addcard can be triggered with or without further input
		// There are three cases
		// user: add // no adtl input
		// user: add Catch up with mueller // only title given
		// The two below I'm not going to worry about yet
		// user: add Removed kitten virus from mainframe Finished // title, list given
		// user: add to Finished // only list given

		const title = message.match[1] 
		console.log({title})
		if (title) {
			bot.trello.addCard(title).then(data => console.log({data}))
				.catch(err => {
					bot.reply(message, 'Something went wrong')
					console.log(err)
				})
		} else {
			bot.createConversation(message, (err, convo) => {
				convo.setTimeout(60000)
				convo.addQuestion(`**What would you like the card's title to be? Respond with the text**`, (res, convo) => {
					console.log(res.text)
					if (res.text === 'cancel') {
						convo.say('Okay, canceled')
						convo.next()
					} else {
						convo.setVar('title', res.text)
						convo.gotoThread('getList')
					}
				}  
, {}, 'getTitle')
				convo.addQuestion(`**Ready to add card "{{vars.title}}" to list ${message.trello_channel.list.name}**\n\n To add to a different list, respond with the number of one from below. \n\nTo cancel, respond with \`cancel\`. Otherwise, the card will be added to the board in 60 seconds.\n\n${message.trello_channel.board.lists.reduce((a,b) => `${a}**${b.index}:** ${b.name} `,'')}`, [
					{
						pattern: '^cancel$',
						callback: (res, convo) => {
								convo.say('Canceled')
								convo.next()
							}
						
					},
					{
						pattern: /^[\d]+$/,
						callback: (res, convo) => {
							console.log('RESPONSE TEXT:',res.text)
							console.log('heard a digit')
							console.log(message.trello_channel.board.lists)
							const list = message.trello_channel.board.lists.find(el => el.index == res.text)
							console.log({list})
							if (list) {
								convo.setVar('list', list)
								convo.say('Nice! Got that list')
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
				], {}, 'getList')
				
				convo.on('end', convo => {
					if (convo.status === 'timeout') {
						if (convo.vars.title) {
							let list 
							if (convo.vars.list) {
								list = convo.vars.list.id
							}
							bot.trello.addCard(convo.vars.title, {listId: list}).then(data => console.log({data}))
										.catch(err => controller.debug(err))
						} 
					}
				})
				convo.activate()
				convo.gotoThread('getTitle')
			})
		}
	})
}