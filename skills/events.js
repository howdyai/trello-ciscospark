var debug = require('debug')('trello:events');

module.exports = (controller) => {

  controller.on('user_space_join', (bot, message) => {
    debug('A new user joined the channel: ', message.user,' in channel ', message.channel);
    controller.storage.channels.get(message.channel, (err, channel) => {
      if (channel) {
        controller.api.rooms.get(message.channel).then(function(room) {
          bot.startPrivateConversation(message, function(err, convo) {
            convo.say(`The channel you just joined, ${room.title}, is linked to the Trello board [${channel.board.name}](${channel.board.url}). Send me \`help\` to see list of available commands.`)
          });
        });
      }
    })
  })
  

  controller.on('bot_space_join', (bot, message) => {

    // load info about who added this bot.
    controller.api.people.get(message.raw_message.actorId).then(function(acting_user) {

      if (acting_user.emails[0] == controller.identity.emails[0]) {
        // this is the bot opening up a new channel
        // in this case we do not want the bot to send these messages.
        return;
      }

      debug('This bot was just added to a new channel: ', message.channel);
      bot.reply(message, 'Thanks for inviting me, **' + acting_user.displayName +  '**! To start using Trello here, please choose an existing board to use this Space.');

      controller.api.rooms.get(message.channel).then(function(channel) {
        bot.startPrivateConversation({
          user: process.env.admin_user
        }, function(err, convo) {
          convo.say('I was just added to a new channel: ' + channel.title);
        });
      });


      // start the board selection process with the user who added the bot.
      // this means the user who added the bot is the only one able to set the board initially.
      controller.trigger('selectBoard', [bot, {
        user: acting_user.emails[0],
        channel: message.channel
      }]);

    });

  })

  controller.on('bot_space_leave', (bot, message) => {

    debug('This bot was just removed from a channel: ', message.channel);

    controller.storage.channels.get(message.channel, (err, channel) => {
      if (channel) {
        controller.storage.channels.delete(message.channel, function(err, res) {
          if (err) debug('Error deleting channel record', err)
        })

      }
    })
  })

}
