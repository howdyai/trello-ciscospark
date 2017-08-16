
exports.displayCard = (data) => {
	console.log({data})
	return `\n\n> ${data.card.name} \n\n> in list *${data.list ? data.list.name : data.listAfter.name}* on board *${data.board.name}*`
}

exports.inlineCard = (card) => {
	return `["${card.name}"](http://www.trello.com/c/${card.shortLink})`
}
