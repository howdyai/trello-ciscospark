
const Trello = require('node-trello')

function TrelloWrapper(user, channel) {

	this.defaultBoard = channel.board.id
	this.defaultList = channel.list.id

	const app_key = process.env.T_KEY

	this.t = new Trello(app_key, user.token || process.env.T_TOKEN)// @TODO dunno if we want a default or not

	const trello_actions = {}

}

TrelloWrapper.prototype.getBoards = function(data) {
	return new Promise(function(resolve, reject) {
		this.t.get("/1/members/me/boards", { lists: 'all', list_fields: 'id,name,pos', organization: true, fields: 'name,id,url'}, (err, data) => {
			if (err) {
				reject(err)
				console.log('err:', err)
			} else resolve(data)
		})
	})

module.create = function(user, channel) => {
	return new TrelloWrapper(user, channel)
}
