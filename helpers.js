
exports.displayCard = (data) => {
	console.log('CARD DATA', {data})
	var card = data.card;
	var board = data.board;
	var list = data.list ||  data.listAfter;

	var lines = [];

	lines.push(`\n\n> **[${card.name}](http://www.trello.com/c/${card.shortLink})**`);
	if (card.desc) {
		lines.push(`> ${card.desc}`);
	}
	lines.push(`> in *${list.name}* on [${board.name}](http://www.trello.com/b/${board.shortLink})`);

	var text = lines.join('\n\n');
	console.log('CARD TEXT', text);
	return text;
	//return `\n\n> ${data.card.name} \n\n> in  *${data.list ? data.list.name : data.listAfter.name}* on board *${data.board.name}*`
}

exports.inlineCard = (card) => {
	return `["${card.name}"](http://www.trello.com/c/${card.shortLink})`
}
