
var debug = require('debug')('trello:search');


const {
  inlineCard,
  displayCard,
  resultsCard,
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
      },{}, 'default');


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

          const displayResults = data.cards.reduce((a, b, c) => a + "* " + resultsCard(b) + "\n\n", '')
          convo.setVar('results', displayResults);

          if (data.cards.length == 0) {
            convo.gotoThread('not_found');
          }

          next();
        }).catch(function(err) {

          if (err.statusMessage == 'Unauthorized') {
            bot.reply(message, 'Uhoh! Your Trello account is not authorized to access this board. Please contact the administrator.');
          } else {
            bot.reply(message, 'Uhoh! I was unable to add this card due to an error with Trello.\n\n> ' + JSON.stringify(err));
          }
          convo.stop();
        })
    });

      // display the results
      convo.addMessage(`Search results for \`{{vars.query}}\` from [**${message.trello_channel.board.name}**](${message.trello_channel.board.url}) on Trello:\n\n{{{vars.results}}}`,'results');

      // display a no match message
      convo.addMessage(`No match for \`{{vars.query}}\` in [**${message.trello_channel.board.name}**](${message.trello_channel.board.url}) on Trello.`,'not_found');

      convo.activate();

    });

});
}
