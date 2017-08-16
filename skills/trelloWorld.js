
const Trello = require('node-trello')
const t = new Trello(process.env.T_KEY, process.env.T_TOKEN)

function TrelloWrapper(user) {


}

TrelloWrapper.prototype.getBoards = () => {

}

exports.create = (user, channel) => new TrelloWrapper(user, channel)


module.exports = function(controller) {


}
