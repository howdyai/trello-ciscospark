var debug = require('debug')('trello:middleware');

module.exports = (controller) => {

  // capture and disgard messages from the bot itself
  controller.middleware.receive.use((bot, message, next) => {
    if (message.type != 'self_message') {
      next();
    } else {
      // debug('Disgarding self message...');
    }
  });

  // this middleware checks to see if a message is already part of a conversation
  // this helps to prevent the bot from interjecting requests to authenticate
  // while the user is mid-process!
  controller.middleware.receive.use((bot, message, next) => {

    if (message.type == 'direct_message' || message.type == 'direct_mention') {
      bot.findConversation(message, function(convo) {
        if (convo) {
          message.in_convo = true;
        }
        next();
      });
    } else {
      next();
    }
  });


  // load the global trello configuration
  // if it is not present, fire the setupTrello event
  controller.middleware.receive.use((bot, message, next) => {
    controller.storage.config.get().then(config => {
      if (!config.token) {

        if (message.in_convo) {
          return next()
        }

        debug('No admin token found, triggering setup')

        if (process.env.admin_user === message.user) {
          bot.reply(message, "Before you use me, let's finish the setup process!")
          controller.trigger('setupTrello', [bot, message])
        } else {
          bot.reply(message, "Sorry, I'm waiting to be setup by the administrator")
        }
      } else {
        message.trello_config = config
        next()
      }
    }).catch(err => next(err))
  });


  // Get user config, or prompt user to auth their trello account
  controller.middleware.receive.use((bot, message, next) => {
    if (message.type == 'direct_message' || message.type == 'direct_mention') {
      controller.storage.users.get(message.user, (err, user) => {
        if (!user) {
          if (message.in_convo) {
            return next()
          }
          debug('=====No user record found, triggering setupUser')
          controller.trigger('setupUser', [bot, message])
        } else {
          message.trello_user = user
          next()
        }
      })
    } else {
      next();
    }
  });

  // Get channel config, or prompt user to set up a board for the channel
  controller.middleware.receive.use((bot, message, next) => {
    if (message.type == 'direct_message' || message.type == 'direct_mention') {
      controller.storage.channels.get(message.channel, (err, channel) => {
        if (!channel) {
          if (message.in_convo) {
            return next()
          }
          debug('No channel set up, triggering selectBoard')
          bot.trello = controller.trelloActions.create({
            config: message.trello_config,
            user: message.trello_user
          })
          controller.trigger('selectBoard', [bot, message])

        } else {
          message.trello_channel = channel
          next()
        }
      })

    } else {
      next();
    }
  })

  // If user and board are set up, configure trello wrapper for their account
  controller.middleware.receive.use((bot, message, next) => {

    if (message.in_convo) {
      return next()
    }
    if (message.trello_config && message.trello_user && message.trello_channel) {
      bot.trello = controller.trelloActions.create({
        config: message.trello_config,
        user: message.trello_user,
        channel: message.trello_channel
      })
    } else if (!bot.trello && message.trello_config) {
      // make sure we have a trello client!
      bot.trello = controller.trelloActions.create({
        config: message.trello_config,
      });
    }
    next()
  });


}
