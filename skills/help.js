module.exports = (controller) => {

	controller.on('help', (bot, message) => {
		bot.reply(message, "I can help you get things done with Trello! Currently, my commands are:\n\n\n\n`boards`: Show the boards your organization has access to, select one from the list to set the default board for the channel \n\n`search <query>`: Show cards that partially match your query, you can use the move command afterwards to move any of the cards to new lists \n\n`move`: Find a card to move to a new list")
	})


}
