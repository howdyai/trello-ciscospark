
module.exports = (controller) => {
	const admin_user = process.env.admin_user
	const bot = controller.spawn({})

	// Check on startup if trello is set up for the team, trigger trello setup if not
	controller.storage.teams.get('trello', (err, config) => {
		if (! config) {
			controller.trigger('setupTrello', [bot])
		}
	})
	
	// goal, setup new user who isnt in the DB already
	controller.on('setupUser', (bot, message) => {
			bot.reply(message, `Please login first with your trello account [here](${process.env.public_address}/login?user=${message.user}&channel=${message.channel})`)
	})

	controller.on('setupTrello', (bot, message) => {
		bot.startPrivateConversation({user: admin_user}, (err, convo) => {
			convo.say(`Hello, creator! Please [login with Trello](${process.env.public_address}/login?user=${admin_user}) and select your team's Trello Organization `)
		})
	})

	controller.on('oauthSuccess', (bot, data) => {

		const userObj = {
			id: data.user,
			token: data.token, 
			trello_id: '',
			first_name: '',
			last_name: '', 
			email: ''
		}
		console.log({data})

		controller.storage.users.save(userObj, (err, user) => {
			if (err) {
				console.log(err)
			} else {
				if (data.user === process.env.admin_user) {
					data.channel = data.user
					bot.trello = controller.trelloActions.create(userObj)
					controller.trigger('setupOrg', [bot, data])
				} else {
					bot.reply({toPersonEmail: data.channel}, "All set up! Here's help text")
				}

			}

		})
	})

	controller.on('setupOrg', (bot, message) => {
		bot.trello.listOrgs().then((orgs) => {

			const orgList = orgs.map((el, i) => `\n\n**${i}:** ${el.displayName}`).join('')
			console.log({message})
			
			bot.startPrivateConversation(message, function(err, convo) {
				console.log({convo})
				convo.ask(`Which Organization are your team's boards in? Respond with a number, *e.g. \`Trello\` 2* ${orgList}`, [
					{
						pattern: /^[\d]+$/,
						callback: (res, convo) => {
							console.log({res})
							if (orgs[res.text]) {
								convo.say('Wooooowwweeeeee!')
								controller.storage.teams.save({
									// when will I need to lookup the org? When 
									id: 'trello',
									org: orgs[res.text].id,
									token: message.token
								}, (err, channel) => {
									if (err) console.log('=======ERROR SAVING')
									else console.log('========SAVED CHANNEL: ', channel)
								})
							} else {
								convo.say('Sorry, that number was out of range')
								convo.repeat()
							}
							convo.next()
						}
					}, 
					{
						default: true,
						callback: (res, convo) => {
							convo.repeat()
							// convo.next()
						}
					}
				])
		})
		})
	})

}
