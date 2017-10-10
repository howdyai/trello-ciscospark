module.exports = (controller) => {

  controller.on('help', (bot, message) => {
    bot.reply(message, "I can help you get things done with Trello! Currently, my commands are:\n\n`add <title>`: Create a new card and add it to the current board. Put card title after the add command to quickly add a card to the default list for the channel. Or, just send `add` and follow the prompts to add a card to whichever list you want\n\n`boards`: Show the boards your organization has access to, select one from the list to set the default board for the channel \n\n`search <query>`: Show cards that partially match your query, you can use the move command afterwards to move any of the cards to new lists")
  })


}
