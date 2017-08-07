module.exports = function(controller) {

	controller.hears('^help$', 'direct_message, direct_mention', function(bot, message) {
		bot.reply(message, "I can help you get things done with Trello! Currently, my commands are:\n\n\n\n`boards`: Show the boards your organization has access to, select one from the list to set the default board for the channel \n\n`search <query>`: Show cards that partially match your query, you can use the move command afterwards to move any of the cards to new lists \n\n`move`: Find a card to move to a new list")
	})


    // This before middleware allows the help command to accept sub-thread names as a parameter
    // so users can say help to get the default thread, but help <subthread> will automatically
    // jump to that subthread (if it exists)
    controller.studio.before('help', function(convo, next) {

        // is there a parameter on the help command?
        // if so, change topic.
        if (matches = convo.source_message.text.match(/^help (.*)/i)) {
            if (convo.hasThread(matches[1])) {
                convo.gotoThread(matches[1]);
            }
        }

        next();

    });

}
