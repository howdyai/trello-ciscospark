var uuid = require('uuid').v1
const Trello = require('node-trello')

var WEBHOOK_ROOT = process.env.public_address
const app_key = process.env.T_KEY

var TrelloWrapper = function(opts) {
	let token 
	if (! opts.user) {
		// use admin token for system actions like configuring webhooks
		token = opts.config.token
	} else {
		token = opts.user.token
	}

	if (opts.channel && opts.channel.board && opts.channel.list) {
		this.defaultBoard = opts.channel.board.id
		this.defaultList = opts.channel.list.id
		this.channelId = opts.channel.id
	}

	if (opts.config) {
		this.defaultOrg = opts.config.orgId
	}

	this.t = new Trello(app_key, token)

}

TrelloWrapper.prototype.getBoards = function(data) {
	return new Promise((resolve, reject) => {
		this.t.get(`/1/organizations/${this.defaultOrg}/boards`, { filter: 'open', lists: 'all', list_fields: 'id,name,pos', organization: true, fields: 'name,id,url'}, (err, data) => {
			if (err) {
				reject(err)
			} else resolve(data)
		})
	})
}

TrelloWrapper.prototype.listOrgs = function() {
	return new Promise((resolve, reject) => {
		this.t.get('1/members/me/organizations', {fields: 'displayName,id'}, (err, data) => {
		if (err) {
			reject(err)
		} else {
			resolve(data)
		}
		})
	})

}

TrelloWrapper.prototype.searchBoard = function(query, opts) {
	var boardId = opts && opts.boardId ? opts.boardId : this.defaultBoard
	return new Promise((resolve, reject) => {
		if (! boardId) {
			reject({message: 'Error, no board default set or provided'})
			return
		}
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
TrelloWrapper.prototype.addCard = function(data) {
	return new Promise((resolve, reject)=> {
		if (!data)  {
			reject('Error, data arg required')
		}
		const listId = this.defaultList
		if (! data.title) {
			reject('Error, no title provided')
		} else {
			this.t.post('/1/cards/', {
			name: data.title,
			desc: data.desc || '',
			idList: listId
		},
			function(err, data) {
				if (err) {
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
				reject(err)
			} else {
				resolve(data)
			}
	})
})
}

TrelloWrapper.prototype.registerBoardWebhook = function(opts) {
	return new Promise((resolve, reject) => {
		var webhookUuid = uuid()
		this.t.post('1/webhooks', {idModel: opts.boardId, callbackURL: `${WEBHOOK_ROOT}/trello/receive?channel=${opts.channel}&uuid=${webhookUuid}`}, (err, data) => {
		if (err) {
			reject(err)
		} else {
			data.uuid = webhookUuid
			resolve(data)
		}
	})

})
}

TrelloWrapper.prototype.updateBoardWebhook = function(opts) {
	return new Promise((resolve, reject) => {
		this.t.put('1/webhooks/' + opts.webhook.id, { idModel: opts.boardId, callbackURL: `${WEBHOOK_ROOT}/trello/receive?channel=${opts.channel}&uuid=${opts.webhook.uuid}` }, (err, data) => {
		if (err) {
			reject(err)
		} else {
			data.uuid = opts.webhook.uuid
			resolve(data)
		}
	})
})
}

exports.create = function(opts) {
	if (! opts) {
		console.log('Error, no options passed to trello wrapper')
		return
	}
	return new TrelloWrapper(opts)
}

// module.create = function(user, channel) {
// 	return new TrelloWrapper(user, channel)
// }
