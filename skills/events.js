var debug = require('debug')('trello:events');

module.exports = (controller) => {

  controller.on('user_space_join', (bot, message) => {
    debug('A new user joined the channel: ', message.user,' in channel ', message.channel);
    controller.channels.get(message.channel, (err, channel) => {
      if (channel) {
        bot.reply(message, `Welcome! Currently this channel is set up to receive alerts from, and interact with, the Trello board [${channel.board.name}](${channel.board.url}) from this channel. Send me \`help\` to see  list of available commands.`)
      }
    })
  })

  controller.on('bot_space_join', (bot, message) => {

    // load info about who added this bot.
    controller.api.people.get(message.raw_message.actorId).then(function(acting_user) {

      debug('This bot was just added to a new channel: ', message.channel);
      bot.reply(message, 'Thanks for inviting me, **' + acting_user.displayName +  '**! To start using Trello here, please choose an existing board to use this Space.');

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
