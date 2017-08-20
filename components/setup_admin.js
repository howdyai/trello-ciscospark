
module.exports = (controller) => {
	const admin_user = process.env.admin_user
	const bot = controller.spawn({})

	// Check on startup if there is an admin account, trigger admin setup if not
	controller.storage.users.get(admin_user, (err, admin) => {
		console.log({admin})
		if (! admin ) {
			controller.trigger('setupAdmin', [bot])
		}
	})
	
	// goal, setup new user who isnt in the DB already
	controller.on('setupUser', (bot, message) => {
		console.log('====setup user handler')
		console.log({message})
		bot.reply(message, `Please login first with your trello account [here](${process.env.public_address}/login?user=${message.user}&channel=${message.channel})`)
	})

	controller.on('oauthSuccess', (bot, data) => {

		// grab user trello profile?
		// where does the wrapper come into play then?
		//


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
					bot.reply({channel: data.channel}, "All set up! Here's help text")
				}

			}

		})
	})
	controller.on('setupAdmin', (bot, message) => {
		console.log('Triggerin setupAdmin!')
		bot.startPrivateConversation({user: admin_user, channel: admin_user}, (err, convo) => {
			convo.say(`Hello, creator! Please [login with Trello](${process.env.public_address}/login?user=${admin_user}) and select your team's Trello Organization `)
		})
	})

	controller.on('setupOrg', (bot, message) => {
		bot.trello.listOrgs().then((orgs) => {

			const orgList = orgs.map((el, i) => `\n\n**${i}:** ${el.displayName}`).join('')
			
			bot.startPrivateConversation(message, (err, convo) => {
				convo.ask(`Which Organization are your team's boards in? Respond with a number, *e.g. \`Trello\` 2* ${orgList}`, [
					{
						pattern: /^[\d]+$/,
						callback: (res, convo) => {
							console.log({res})
							if (orgs[res.text]) {
								convo.say('Wooooowwweeeeee!')
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
							convo.next()
						}
					}
				])
		})
		})
	})

}
