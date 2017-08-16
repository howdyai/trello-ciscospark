
const Trello = require('node-trello')

var TrelloWrapper = function(user, channel) {

	if (channel) {
		this.defaultBoard = channel.board.id || null
		this.defaultList = channel.list.id || null
	}


	const app_key = process.env.T_KEY

	this.t = new Trello(app_key, user.token || process.env.T_TOKEN)// @TODO dunno if we want a default or not
	
	const trello_actions = {}

}

TrelloWrapper.prototype.getBoards = function(data) {
	console.log(this)
	return new Promise((resolve, reject) => {
		console.log('THIS IN PROMISE', this)
		this.t.get("/1/members/me/boards", { lists: 'all', list_fields: 'id,name,pos', organization: true, fields: 'name,id,url'}, (err, data) => {
			if (err) {
				reject(err)
				console.log('err:', err)
			} else resolve(data)
		})
	})
}

TrelloWrapper.prototype.listOrgs = function() {
	return new Promise((resolve, reject) => {
		t.get('1/members/me/organizations', {fields: 'displayName,id'}, (err, data) => {
		if (err) {
			console.log('err:', err)
			reject(err)
		} else {
			resolve(data)
		}
		})
	})

}

TrelloWrapper.prototype.search = function(query) {
	return new Promise((resolve, reject) => {
		t.get('1/search', {
			query: query,
			modelTypes: 'cards',
			idBoards: message.channel_config.board.id,
			card_fields: 'name,desc,due,subscribed',
			card_list: true,
			partial: true
		},
			(err, data) => {
		if (err) {
			console.log('err:', err)
			reject(err)
		} else {
			resolve(data)
		}
			})
	})
}

TrelloWrapper.prototype.addCard = function(data) {
	return new Promise((resolve, reject)=> {
		this.t.post('/1/cards/', {
		name: message.match[1], 
		idList: channel.list.id
	}, 
		function(err, data) {
			if (err) {
				console.log('err:', err)
				reject(err)
			} else {
				resolve(data)
			}
	})
})
}

TrelloWrapper.prototype.updateWebhook = function(message, board) {
	return promise ((resolve, reject) => {
		this.t.put('1/webhooks/' + message.channel_config.webhook.id, { idModel: board.id, callbackURL: `${process.env.public_address}/trello/receive?channel=${message.channel}` }, (err, data) => {
		if (err) {
			console.log('Error updating webhook: ', err)
			reject(err)
		} else {
			resolve(data)
		}
	})


})
}

TrelloWrapper.prototype.createWebhook = function(message, board) {
	return new Promise((resolve, reject) => {
		this.t.post('1/webhooks', {idModel: board.id, callbackURL: `${process.env.public_address}/trello/receive?channel=${message.channel}`}, (err, data) => {
		if (err) {
			console.log('Error setting up webhook: ', err)
		} else {
			controller.storage.channels.save({
				id: message.channel,
				board: board,
				list: board.lists[0],
				webhook: data
			}, (err, data) => {
				if (err) {
					console.log({err})
					reject(err)
				} else {
					resolve(data)
				}
			})
		}
	})

})
}


exports.create = function(user, channel) {
	return new TrelloWrapper(user, channel)
}	

// module.create = function(user, channel) {
// 	return new TrelloWrapper(user, channel)
// }
