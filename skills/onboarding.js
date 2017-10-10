
module.exports = function(controller) {
  const admin_user = process.env.admin_user
  const bot = controller.spawn({})

  // goal, setup new user who isnt in the DB already
  controller.on('setupUser', (bot, message) => {
    bot.reply(message, `Please [authorize your Trello account here](${process.env.public_address}/login?user=${message.user}&channel=${message.channel})`)
  })

  controller.on('setupTrello', (bot, message) => {
    bot.startPrivateConversation({
      user: admin_user
    }, (err, convo) => {
      convo.say(`Hello, creator! I am your new Trello bot! When added to a channel, I can help do things like add cards, search cards, and keep up to date on activity in Trello, all without leaving the chat room!`);
      convo.say(`To continue the setup process, please [authorize your Trello account.](${process.env.public_address}/login?user=${admin_user})`)
    })
  })

  controller.on('oauthSuccess', (bot, data) => {

    const userObj = {
      id: data.user,
      token: data.token,
    }

    // do a get, copy user record
    controller.storage.users.save(userObj, (err, user) => {
      if (err) {
        controller.log('Error saving user', err)
      } else {
        data.channel = data.user

        // if user is admin user
        // start the setup process
        if (data.user === process.env.admin_user) {
          bot.trello = controller.trelloActions.create({
            user: userObj
          })
          controller.trigger('setupOrg', [bot, data])
        } else {

          // otherwise, just send a friendly success message
          bot.startPrivateConversation(data, function(err, convo) {
              convo.say('Thank you for authorizing your Trello account!');
              convo.say('We are all set.');
          });
        }

      }

    })
  });

  controller.on('setupOrg', function(bot, message) {
    bot.trello.listOrgs().then(function(orgs) {

      orgs = orgs.map((el, i) => {
        return {
          index: `${i + 1}`,
          display: `\n\n**${i + 1}:** ${el.displayName}`,
          orgId: el.id,
          name: el.displayName
        }
      })
      // Join orgs display into string to send to user
      const displayOrgs = orgs.map(el => el.display).join('')

      bot.startPrivateConversation(message, function(err, convo) {
        convo.ask(`Which organization are your team's boards in? Respond with the number ${displayOrgs}`, [{
            pattern: /^[\d]+$/,
            callback: (res, convo) => {
              const match = orgs.find(el => el.index == res.text)
              if (match) {

                controller.storage.config.save({
                    // when will I need to lookup the org? When
                    orgId: match.orgId,
                    orgName: match.name,
                    token: message.token
                  })
                  .then(config => controller.log(`Set organization to ${config.orgName}`))
                  .catch(err => controller.log('Error saving config', err))


                  convo.gotoThread('completed');

              } else {
                convo.gotoThread('default');
              }
            }
          },
          {
            default: true,
            callback: (res, convo) => {
              convo.gotoThread('default');
            }
          }
        ]);

        convo.addMessage('Excellent! I am now configured to work with Trello.','completed');
        convo.addMessage('Next, invite me into a channel to get started!','completed');

      })
    })
  })
}
