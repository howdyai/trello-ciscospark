
const Trello = require('node-trello')
const t = new Trello(process.env.T_KEY, process.env.T_TOKEN)

module.exports = function(controller) {

	
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
	
	controller.hears('(.*)', 'direct_mention,direct_message', (bot, message) => {
		bot.reply(message, 'Catchall, I will persist after you perish. I heard: ' + message.text)
	})

	controller.on('bot_space_join', (bot, message) => {
		controller.storage.channels.get(message.channel, function(err, channel) {

		if (! channel || ! channel.list) {
			bot.reply(message, 'Thanks for inviting me! To start using Trello here, assign a board to this Space')
			controller.trigger('selectBoard', [bot, message])
		}
		})
	})

	controller.on('bot_space_leave', (bot, message) => {
		controller.storage.channels.get(message.channel, (err, channel) => {
			if (channel && channel.webhook) {
				t.del(`/1/webhooks/${message.trelloChannel.webhook.id}`, function(err, data) {
					if (err) console.log('Error deleting webhook')
					else console.log({data})
				})
				controller.storage.channels.delete(message.channel, function(err, res) {
					if (err) console.log('err deleting channel record', err)
				})
			} else console.log('==== No Channel record found')
		})
	})

	controller.on('selectBoard', function(bot, message) {
		t.get("/1/members/me/boards", { lists: 'all', list_fields: 'id,name,pos', organization: true, fields: 'name,id,url'}, function(err, data) {
			if (err) {
				console.log('err:', err)
			} else {
				const boardArray = data
				let boardList = data.map((el, i) => `\n\n**${i}:** ${el.name}`)
				boardList = boardList.join('')
				if (message.user === controller.identity.emails[0]) {
					// space joins will have bot identity as user, this works around that
					controller.api.people.get(message.original_message.actorId).then(function(identity) {
						console.log({identity})
						message.user = identity.emails[0]
						controller.trigger('selectBoard', [bot, message])
					})
				} else {
					bot.startConversation(message, function(err, convo) {

						convo.ask(`**Reply with a number from the list to set the default board for this Space.**\n\n*Hint: I can only hear you if you start your message with*  \`Trello\`\n\n${boardList}`, [
							{
								pattern: /^[\d]+$/,
								callback: function(res, convo) {
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
											t.put('1/webhooks/' + message.trelloChannel.webhook.id, { idModel: board.id, callbackURL: `${process.env.public_address}/trello/receive?channel=${message.channel}` }, function(err, data) {
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
											t.post('1/webhooks', {idModel: board.id, callbackURL: `${process.env.public_address}/trello/receive?channel=${message.channel}`}, function(err, data) {
												if (err) {
													console.log('Error setting up webhook: ', err)
												} else {
													controller.storage.channels.save({
														id: message.channel,
														board: board,
														list: board.lists[0],
														webhook: data
													}, function (err, res) {
														if (err) {
															console.log({err})
														}
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
								callback: function(res, convo) {
									convo.repeat()
									convo.next()
								}
							}
						])
						// function(res, convo) {
						//	if (res.text.match(/^[\d]+$/) && boardList[res.text]) {
						//		const board = boardList[res.text]
						//		// set the channel board default, what about list default?
						//		console.log({board})
						//		convo.say('Landed one!')
						//		convo.next()
						//	} else {
						//		convo.silentRepeat()
						//	}
					

					convo.next()
					})

				}
			}
		})
	})
}
