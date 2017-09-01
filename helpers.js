
exports.displayCard = (data) => {
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
	return text;
}

exports.inlineCard = (card) => {
	return `["${card.name}"](http://www.trello.com/c/${card.shortLink})`
}
