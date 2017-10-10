
const {
  inlineCard,
  displayCard
} = require('../helpers')


module.exports = function(controller) {


  // emit a pretty card when a new one is created.
  controller.on('trello_createCard', function(bot, message, card) {
    bot.reply(message, `${message.user} created a card:\n ${displayCard(card)}`);

  });

  // emit a pretty card when a new one is created.
  controller.on('trello_updateCard', function(bot, message, card) {
    bot.reply(message, `${message.user} updated a card:\n ${displayCard(card)}`);
  });

  // post a message when a card is moved
  controller.on('trello_moveCard', function(bot, message, card) {
    bot.reply(message, `${message.user} moved ${inlineCard(card.card)} from *${card.listBefore.name}* to *${card.listAfter.name}*`);
  });

  // post a message when a card is archived
  controller.on('trello_archiveCard', function(bot, message, card) {
    bot.reply(message, `${message.user} archived a card:\n ${displayCard(card)}`);

  });

  // post a message when a new comment is added to a card
  controller.on('trello_commentCard', function(bot, message, comment) {
    bot.reply(message,`${message.user} commented on ${inlineCard(comment.card)}:\n\n> ${comment.text}`);
  });


  // post a message when a new checklist is added to a card
  controller.on('trello_checklistCreate', function(bot, message, card) {
    bot.reply(message,`${message.user} added a checklist to ${inlineCard(card.card)}`);
  });

  // post a message when a new checklist item is created
  controller.on('trello_checkItemCreate', function(bot, message, card) {
    bot.reply(message,`${message.user} added a checklist item to ${inlineCard(card.card)}:\n\n> ${card.checkItem.name}`);
  });

  // post an update when a checklist item is marked as completed
  controller.on('trello_checkItemComplete', function(bot, message, card) {
    bot.reply(message,`${message.user} marked a checklist item on ${inlineCard(card.card)} as complete:\n\n> ✅ ${card.checkItem.name}`);
  });

  // post an update when a checklist item is marked as NOT completed
  controller.on('trello_checkItemIncomplete', function(bot, message, card) {
    bot.reply(message,`${message.user} marked a checklist item on ${inlineCard(card.card)} as incomplete:\n\n> ${card.checkItem.name}`);
  });





}
