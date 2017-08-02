
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


	controller.hears('(.*)', 'direct_mention,direct_message', (bot, message) => {
		bot.reply(message, 'Catchall, I will persist after you perish. I heard: ' + message.text)
	})

	controller.on('bot_space_join', (bot, message) => {
		message.trello = {}
		// this check will need to happen in a middleware before all receiveMessage events
		// which I don't think this would trigger anyways, so we need to have a check here too probably
		// or at least want the opportunity to have a different message in this particular context
		if (! message.trello.defaultBoard && ! message.trello.defaultList) {
			bot.reply(message, 'Thanks for inviting me!')
			controller.trigger('selectBoard', [bot, message])
		}
	})

	controller.on('selectBoard', function(bot, message) {
		t.get("/1/members/me/boards", { lists: 'all', list_fields: 'id,name', organization: true, fields: 'name,id'}, function(err, data) {
			if (err) {
				console.log('err:', err)
			} else {
				let boardList = data.map((el, i) => `\n\n**${i}:** ${el.name}`)
				boardList = boardList.join('')
				console.log(message.original_message.data)
				if (message.user === controller.identity.emails[0]) {
					// space joins will have bot identity as user, this works around that
					controller.api.people.get(message.original_message.actorId).then(function(identity) {
						console.log({identity})
						message.user = identity.emails[0]
						controller.trigger('selectBoard', [bot, message])
					})
				} else {
					bot.startConversation(message, function(err, convo) {

						convo.ask('To start using Trello here, assign a board to this Space, **reply with a number from the list.**\n\n*Hint: I can only hear you if you start your message with*  `Trello`\n\n' + boardList, function(res, convo) {
							if (res.text.match(/^[\d]+$/) && boardList[res.text]) {
								const board = boardList[res.text]
								// set the channel board default, what about list default?
								console.log({board})
								convo.say('Landed one!')
								convo.next()
							} else {
								convo.silentRepeat()
							}
					})

					convo.next()
					})

				}
			}
		})
	})
}
