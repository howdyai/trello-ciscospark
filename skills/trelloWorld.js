
const Trello = require('node-trello')
const t = new Trello(process.env.T_KEY, process.env.T_TOKEN)

module.exports = function(controller) {

	// list all user boards
	controller.hears('^boards$', 'direct_message,direct_mention', function(bot, message){
		t.get("/1/members/me/boards", { organization: true, fields: 'name,id'}, function(err, data) {
			if (err) {
				console.log('err:', err)
			} else {
				console.log({data})
				console.log('Data length: ', data.length)
				console.log(data[0].organization)
				let boardList = data.map((el, i) => `\n\n**${i}:** ${el.name}`)// - Belongs to ${el.organization.displayName}`)
				boardList = boardList.join('')
				bot.reply(message, "**Pick a Board, respond with its number:**" + boardList)
			}
		})
	})
	
	// list all user orgs
	controller.hears('^orgs$', 'direct_message', function(bot, message) {

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
	controller.hears('^search(.*)', 'direct_message,direct_mention)', function(bot, message) {
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
}
