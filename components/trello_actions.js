
const Trello = require('node-trello')

var WEBHOOK_ROOT = process.env.public_address

var TrelloWrapper = function(opts) {
	console.log('===== ARGUEMNTS LENGTH',arguments.length)
	if (opts.user === undefined) {
		console.log('user undefined')
		// use admin token for system actions like configuring webhooks
		opts.user = {token: opts.config.token}
	}

	if (opts.channel && opts.channel.board && opts.channel.list) {
		this.defaultBoard = opts.channel.board.id
		this.defaultList = opts.channel.list.id
		this.channelId = opts.channel.id
	}

	if (opts.config) {
		this.defaultOrg = opts.config.orgId
	}
	
	// controller.teams.get('trello', (err, trello) => {
	// 	if (trello) {
	// 		defaultOrg
	// 	}
	// })
	// this.defaultOrg = 

	const app_key = process.env.T_KEY

	this.t = new Trello(app_key, opts.user.token)// @TODO dunno if we want a default or not

}

TrelloWrapper.prototype.getBoards = function(data) {
	console.log(this)
	return new Promise((resolve, reject) => {
		this.t.get(`/1/organizations/${this.defaultOrg}/boards`, { filter: 'open', lists: 'all', list_fields: 'id,name,pos', organization: true, fields: 'name,id,url'}, (err, data) => {
			if (err) {
				reject(err)
				console.log('err:', err)
			} else resolve(data)
		})
	})
}

TrelloWrapper.prototype.listOrgs = function() {
	return new Promise((resolve, reject) => {
		this.t.get('1/members/me/organizations', {fields: 'displayName,id'}, (err, data) => {
		if (err) {
			console.log('err:', err)
			reject(err)
		} else {
			resolve(data)
		}
		})
	})

}

TrelloWrapper.prototype.searchBoard = function(query, opts) {
	var boardId = opts && opts.boardId ? opts.boardId : this.defaultBoard
	if (! boardId) {
		console.log('Error, no board default set or provided')
		return
	}
	return new Promise((resolve, reject) => {
		this.t.get('1/search', {
			query: query,
			modelTypes: 'cards',
			idBoards: boardId,
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
// args should maybe be text: String, opts: object
// default channel/list settings can be plugged into the wrapper
// so defaults are inferred if not passed in opts
TrelloWrapper.prototype.addCard = function(cardTitle, opts) {
	return new Promise((resolve, reject)=> {
		var listId = opts && opts.listId ? opts.listId : this.defaultList
		console.log({listId})
		if (! listId) {
			reject('Error, no list provided or inferred')
		} else {
			this.t.post('/1/cards/', {
			name: cardTitle,
			idList: listId
		},
			function(err, data) {
				if (err) {
					console.log('err:', err)
					reject(err)
				} else {
					resolve(data)
				}
		})

		}

})
}

TrelloWrapper.prototype.moveCard = function(cardId, listId) {
	return new Promise((resolve, reject)=> {
		this.t.put(`1/cards/${cardId}`, {idList: listId}, (err, data) => {
			if (err) {
				console.log('err:', err)
				reject(err)
			} else {
				resolve(data)
			}
	})
})
}

TrelloWrapper.prototype.registerBoardWebhook = function(opts) {
	// opts = {
	// 	channel: '',
	// 	boardId: '',
	// }
	return new Promise((resolve, reject) => {
		this.t.post('1/webhooks', {idModel: opts.boardId, callbackURL: `${WEBHOOK_ROOT}/trello/receive?channel=${opts.channel}`}, (err, data) => {
		if (err) {
			console.log('Error setting up webhook: ', err)
			reject(err)
		} else {
			resolve(data)
		}
	})

})
}

TrelloWrapper.prototype.updateBoardWebhook = function(opts) {
	return new Promise((resolve, reject) => {
		this.t.put('1/webhooks/' + opts.webhookId, { idModel: opts.boardId, callbackURL: `${WEBHOOK_ROOT}/trello/receive?channel=${opts.channel}` }, (err, data) => {
		if (err) {
			console.log('Error updating webhook: ', err)
			reject(err)
		} else {
			resolve(data)
		}
	})
})
}

exports.create = function(opts) {
	return new TrelloWrapper(opts)
}

// module.create = function(user, channel) {
// 	return new TrelloWrapper(user, channel)
// }