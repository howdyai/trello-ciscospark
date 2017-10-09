
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

  controller.on('trello_moveCard', function(bot, message, card) {
    bot.reply(message, `${message.user} moved ${inlineCard(card.card)} from *${card.listBefore.name}* to *${card.listAfter.name}*`);
  });


  controller.on('trello_archiveCard', function(bot, message, card) {
    bot.reply(message, `${message.user} archived a card:\n ${displayCard(card)}`);

  });



  controller.on('trello_commentCard', function(bot, message, comment) {

    bot.reply(message,`${message.user} commented on ${inlineCard(comment.card)}:\n\n> ${comment.text}`);

  });





}
