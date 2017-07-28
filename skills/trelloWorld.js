
const Trello = require('node-trello')
const t = new Trello(process.env.T_KEY, process.env.T_TOKEN)

module.exports = function(controller) {

	// list all user boards
	controller.hears(['^boards$'], 'direct_message,direct_mention', function(bot, message){
		t.get("/1/members/me/boards", { lists: 'all', list_fields: 'id,name', organization: true, fields: 'name,id'}, function(err, data) {
			if (err) {
				console.log('err:', err)
			} else {
				console.log({data})
				console.log('Data length: ', data.length)
				console.log('lists========\n',data[3].lists)
				let boardList = data.map((el, i) => `\n\n**${i}:** ${el.name}`)// - Belongs to ${el.organization.displayName}`)
				boardList = boardList.join('')
				bot.reply(message, "**Pick a Board, respond with its number:**" + boardList)
			}
		})
	})
	
	// list all user orgs
	controller.hears(['^orgs$'], 'direct_message, direct_mention', function(bot, message) {

		t.get('1/members/me/organizations', {fields: 'displayName,id'}, (err, data) => {
		if (err) {
			console.log('err:', err)
			bot.reply(message, 'Something has gone wrong')
		} else {
			console.log({data})
			let orgList = data.map((el, i) => `\n\n**${i}:** ${el.displayName}`)
					.join('')
			bot.reply(message, "**Organizations you belong to:**" + orgList)
		}
		})
	})
	
	// search cards
	controller.hears(['^search(.*)?$'], 'direct_message,direct_mention', function(bot, message) {
		const query = message.match[1].trim()
		console.log({query})

		t.get('1/search', {
			query: query,
			modelTypes: 'cards',
			card_fields: 'name,desc,due,subscribed',
			cardList: true,
			partial: true
		},
			(err, data) => {
		if (err) {
			console.log('err:', err)
			bot.reply(message, 'Something has gone wrong')
		} else {
			console.log({data})
			console.log(data.cards[0])
			let searchResults = data.cards.map((el, i) => `\n\n**${i}:** ${el.name}\n\n${el.desc}`)
					.join('')
			bot.reply(message, "**Search Results:**" + searchResults)
		}
		})
	})

	controller.hears(['^add (.*)'], 'direct_message, direct_mention', function(bot, message) {
		t.post('/1/cards/', {
			name: message.match[1], 
			idList: bot.trello.defaultList || '584c5cc71c7175671969d78c'
		}, 
			function(err, data) {
				if (err) {
					console.log('err:', err)
					bot.reply(message, 'Something has gone wrong')
				} else {
					bot.reply(message, `Added "${message.match[1]}" to the list **Backlog** on board [**Howdy/Botkit**](https://trello.com/b/ny6fbxCm/botkit-howdy)`)

				}

		})
	})

	controller.hears('^test$', 'direct_message, direct_mention', function(bot, message) {
		console.log({message})
		bot.startConversationWithActor(message, function(err, convo) {
			convo.ask('This is a lil test, how are you?', function(response, convo) {
				convo.say('You said: ' + response.text)
				convo.next()
			})
		})
	})

	controller.on('bot_space_join', (bot, message) => {
		message.trello = {}
		if (! message.trello.defaultBoard && ! message.trello.defaultList) {
			
			t.get("/1/members/me/boards", { lists: 'all', list_fields: 'id,name', organization: true, fields: 'name,id'}, function(err, data) {
				if (err) {
					console.log('err:', err)
				} else {
					let boardList = data.map((el, i) => `\n\n**${i}:** ${el.name}`)
					boardList = boardList.join('')
					console.log({message})

					bot.startConversationWithActor(message, function(err, convo) {
						
						convo.ask('Thanks for inviting me! \n\nBefore I can help you, we need to assign a board to this Space, **reply with a number from the list.** Like this: `Trello 0`\n\n*Hint: I can only hear you if you start your message with*  `Trello`\n\n' + boardList, function(response, convo) {
							if (response.user == 'dev-trello@sparkbot.io') {
								console.log('=======CONVO SOURCE MESSAGE\n',convo.source_message)
								console.log('=======heard a bot message')
								convo.silentRepeat()
								// convo.next()
							} else {
								console.log({response})
								convo.say('Great, I heard you!')
							}

					})

				})
			}
			})
		}
	})

	controller.hears('(.*)', 'direct_mention,direct_message', (bot, message) => {
		console.log('=======MESSAGE IN CATCHALL\n', message)
		bot.reply(message, 'Catchall, I will persist after you perish. I heard: ' + message.text)
	})
}
