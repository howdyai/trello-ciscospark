var debug = require('debug')('trello:add');

module.exports = (controller) => {

  controller.on('addCard', (bot, message) => {
    // so addcard can be triggered with or without further input
    // There are three cases
    // user: add // no adtl input
    // user: add Catch up with mueller // only title given
    // The two below I'm not going to worry about yet
    // user: add Removed kitten virus from mainframe Finished // title, list given
    // user: add to Finished // only list given

    bot.createConversation(message, (err, convo) => {

      // wait 30 seconds for a reply to any question.
      convo.setTimeout(30000);

      const title = message.match[1]
      if (title) {
        convo.setVar('title', title)
        convo.say({
          text: `Adding "{{{vars.title}}}" to ${message.trello_channel.list.name} on board [${message.trello_channel.board.name}](${message.trello_channel.board.url})`,
          action: 'getDesc',
        })
      }


      // Collect the title of the card.
      convo.addQuestion(`Adding a card to *${message.trello_channel.list.name}* on board [${message.trello_channel.board.name}](${message.trello_channel.board.url}).\n\nWhat would you like the card's title to be?`,[
        {
          default: true,
          callback: function(res, convo) {
            convo.setVar('title', res.text);
            convo.gotoThread('getDesc');
          }
        },
        {
          pattern: bot.utterances.quit,
          callback: function(res, convo) {
            convo.gotoThread('quit');
          }
        }
      ],{}, 'default');

      // collect an optional description for the card.
      convo.addQuestion(`If you'd like to add to a description, tell me now. Otherwise, the card will be added as is in a few seconds. To cancel adding the card, respond with \`quit\`.`,[
        {
          default: true,
          callback: function(res, convo) {
            convo.setVar('desc', res.text);
            convo.next();
          }
        },
        {
          pattern: bot.utterances.quit,
          callback: function(res, convo) {
            convo.gotoThread('quit');
          }
        }
      ],{},'getDesc');

      // set up a message for when the user aborts the process.
      convo.addMessage({
        text: 'Card canceled.',
        action: 'stop'
      },'quit');


      // when the conversation ends, add the card.
      convo.on('end', convo => {
        if (convo.status === 'timeout' || convo.status === 'completed') {
          if (convo.vars.title) {
            bot.trello.addCard({
                title: convo.vars.title,
                desc: convo.vars.desc
              }).catch(function(err) {

                if (err.statusMessage == 'Unauthorized') {
                  bot.reply(message, 'Uhoh! Your Trello account is not authorized to access this board. Please contact the administrator.');
                } else {
                  bot.reply(message, 'Uhoh! I was unable to add this card due to an error with Trello.\n\n> ' + JSON.stringify(err));
                }

              });
          }
        }
      })

      convo.activate()

    })

  })
}
