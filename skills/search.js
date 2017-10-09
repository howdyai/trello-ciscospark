
var debug = require('debug')('trello:search');


const {
  inlineCard,
  displayCard
} = require('../helpers')



module.exports = (controller) => {
  controller.on('searchBoard', (bot, message) => {

    debug('Starting a search!');

    bot.createConversation(message, function(err, convo) {


      // if a query was specified as part of the message, we can skip right to the results...
      if (message.match && message.match[1]) {
        convo.setVar('query',message.match[1].trim());
        convo.say({
          text: 'Searching Trello for `{{{vars.query}}}`...',
          action: 'results'});
      }


      // collect a search query from the user.
      convo.addQuestion('What do you want to search for?', function(res, convo) {
        if (res.text) {
          convo.setVar('query',res.text);
          convo.gotoThread('results');
        } else {
          convo.gotoThread('default');
        }
      },'default');


      // before we _display_ the results, first use trello's api to actually
      // do the search!
      convo.beforeThread('results', function(convo, next) {


        var query = convo.vars.query;
        debug('Doing search... for ', query);

        bot.trello.searchBoard(query).then(data => {
          const searchResults = data.cards.map((el, i) => {
            return {
              index: `${i + 1}`,
              display: `\n\n**${i + 1}:** ${el.name}`,
              id: el.id,
              name: el.name,
            }
          })

          const displayResults = data.cards.reduce((a, b, c) => a + "* " + inlineCard(b) + "\n\n", '')
          convo.setVar('results', displayResults);

          if (data.cards.length == 0) {
            convo.gotoThread('not_found');
          }

          next();
        });
    });

      // display the results
      convo.addMessage(`Search results for \`{{vars.query}}\` from [**${message.trello_channel.board.name}**](${message.trello_channel.board.url}) on Trello:\n\n{{{vars.results}}}`,'results');

      // display a no match message
      convo.addMessage(`No match for \`{{vars.query}}\` in [**${message.trello_channel.board.name}**](${message.trello_channel.board.url}) on Trello.`,'not_found');

      convo.activate();

    });


    //
    //   bot.trello.searchBoard(query).then(data => {
    //     const searchResults = data.cards.map((el, i) => {
    //       return {
    //         index: `${i + 1}`,
    //         display: `\n\n**${i + 1}:** ${el.name}`,
    //         id: el.id,
    //         name: el.name,
    //       }
    //     })
    //     const displayResults = searchResults.reduce((a, b, c) => `${a}\n\n**${b.index}:** ${b.name}`, '')
    //
    //     bot.startConversation(message, (err, convo) => {
    //
    //       convo.ask(data.cards.length ? `**Search Results from [**${message.trello_channel.board.name}**](${message.trello_channel.board.url}) for query \`${query}\`:** ${displayResults}` : `No cards found that matched: \`${query}\` in board [**${message.trello_channel.board.name}**](${message.trello_channel.board.url})`, [{
    //           pattern: /^move ([\d]+)$/,
    //           callback: (res, convo) => {
    //             const match = res.text.match(/^move ([\d]+)$/)
    //             const card = searchResults.find(el => el.index === match[1])
    //             if (card) {
    //               convo.setVar('card', card)
    //               const displayDestinations = message.trello_channel.board.lists.reduce((a, b, i) => `${a}\n\n**${b.index}:** ${b.name}`, '')
    //
    //               convo.setVar('destinations', displayDestinations)
    //               convo.ask(`Where would you like to move it?\n\n{{vars.destinations}}`, [{
    //                   pattern: /^[\d]+$/,
    //                   callback: (res, convo) => {
    //                     const list = message.trello_channel.board.lists.find(el => el.index === res.text)
    //                     if (list) {
    //                       bot.trello.moveCard(card.id, list.id)
    //                       convo.next()
    //                     } else {
    //                       convo.repeat()
    //                       convo.next()
    //                     }
    //                   }
    //                 },
    //                 {
    //                   default: true,
    //                   callback: (res, convo) => {
    //                     convo.say('Please select a list, or say \`cancel\`')
    //                     convo.repeat()
    //                     convo.next()
    //                   }
    //                 }
    //               ])
    //               convo.next()
    //             }
    //           }
    //         },
    //         // this is a hack, but allows having an open ended convo, and nesting commands
    //         // if no chainable commands heard after search, bail from the convo and run the text through hears
    //         {
    //           default: true,
    //           callback: (res, convo) => {
    //             convo.stop()
    //             controller.receiveMessage(bot, res)
    //           }
    //         }
    //       ])
    //       // convo.next()
    //     })
    //   }).catch(function(err) {
    //     bot.reply(message, 'An error occured: ' + err);
    //   });
    // } else {
    //   bot.reply(message,'To search Trello, tell to `search <keyword>`');
    // }
});
}
