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

    const title = message.match[1]
    bot.createConversation(message, (err, convo) => {
      convo.setTimeout(30000)
      convo.addQuestion(`**What would you like the card's title to be? Respond with the text**`, (res, convo) => {
        if (res.text === 'cancel') {
          convo.say('Okay, canceled')
          convo.next()
        } else {
          convo.setVar('title', res.text)
          convo.gotoThread('getDesc')
        }
      }, {}, 'getTitle')
      convo.addQuestion(`**Ready to add card "{{vars.title}}" to list ${message.trello_channel.list.name} on board [${message.trello_channel.board.name}](${message.trello_channel.board.url})**\n\n> *To add to a description, respond to me with the with text. Otherwise, the card will be added as is in 30 seconds. To cancel adding the card, respond with \`cancel\`.*`, (res, convo) => {
        if (res.text === 'cancel') {
          convo.say('Okay, canceled')
        } else {
          const desc = res.text
          convo.setVar('desc', desc)

        }
        convo.next()
      }, {}, 'getDesc')

      convo.on('end', convo => {
        if (convo.status === 'timeout' || 'complete') {
          if (convo.vars.title) {
            bot.trello.addCard({
                title: convo.vars.title,
                desc: convo.vars.desc
              })
              .catch(err => controller.debug(err))
          }
        }
      })
      convo.activate()
      if (title) {
        convo.setVar('title', title)
        convo.gotoThread('getDesc')
      } else {
        convo.gotoThread('getTitle')
      }
    })

  })
}
