
const Trello = require('node-trello')
const t = new Trello(process.env.T_KEY, process.env.T_TOKEN)

module.exports = function(controller) {

	controller.hears('(.*)', 'direct_message,direct_mention', function(bot, message){
		t.get("/1/members/me/boards", {filter: 'organization', organization: true, fields: 'name,id'}, function(err, data) {
			if (err) {
				console.log('err:', err)
			} else {
				console.log({data})
				console.log('Data length: ', data.length)
				console.log(data[0].organization)
				let boardList = data.map(el => el.name)// - Belongs to ${el.organization.displayName}`)
				boardList = boardList.join('\n')
				bot.reply(message, 'Here are your boards:' + boardList)
			}
		})
	})
}
