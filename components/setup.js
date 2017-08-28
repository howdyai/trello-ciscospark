
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


		// do a get, copy user record
		controller.storage.users.save(userObj, (err, user) => {
			if (err) {
				console.log(err)
			} else {
				// if user is admin user
				if (data.user === process.env.admin_user) {
					data.channel = data.user
					bot.trello = controller.trelloActions.create({user: userObj})
					controller.trigger('setupOrg', [bot, data])
				} else {
					bot.reply({toPersonEmail: data.channel}, "All set up! Here's help text")
				}

			}

		})
	})

	controller.on('setupOrg', function(bot, message) {
		bot.trello.listOrgs().then(function(orgs) {

			orgs = orgs.map((el, i) => {
				return {
					index: `${i + 1}`,
					display: `\n\n**${i + 1}:** ${el.displayName}`,
					orgId: el.id,
					name: el.displayName
				}
			})
			// Join orgs display into string to send to user
			const displayOrgs = orgs.map(el => el.display).join('')

			bot.startPrivateConversation(message, function(err, convo) {
				console.log('====ASK TO CHOOSE ORG')
				convo.ask(`Which Organization are your team's boards in? Respond with the  number ${displayOrgs}`, [
					{
						pattern: /^[\d]+$/,
						callback: (res, convo) => {
							console.log({res})
							const match = orgs.find(el => el.index == res.text)
							if (match) {
								convo.say(`You chose ${match.name} as the Trello Organization for your team! Invite me to a channel to setup up a board to use in that channel`)
								controller.storage.teams.save({
									// when will I need to lookup the org? When 
									id: 'trello',
									orgId: match.orgId,
									orgName: match.name,
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
