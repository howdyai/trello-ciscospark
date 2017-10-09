var debug = require('debug')('botkit:incoming_webhooks');

const {
  inlineCard,
  displayCard
} = require('../../helpers')

module.exports = function(webserver, controller) {

  webserver.post('/trello/receive', function(req, res) {

    var bot = controller.spawn({})

    //@TODO put this into its own function
    const payload = req.body
    const action = payload.action
    const data = action.data
    const context = {
      channel: req.query.channel
    }
    const webhookUuid = req.query.uuid

    controller.storage.channels.get(req.query.channel, (err, channel) => {
      if (channel && channel.webhook.uuid === webhookUuid) {
        res.status(200).send()

        const userName = action.memberCreator.fullName
        let subject = action.memberCreator.fullName
        let actionText
        let dataText

        if (action.type === 'createCard') {
          actionText = '**created** a card'
          dataText = displayCard(data)
        } else if (action.type === 'commentCard') {
          actionText = `**commented** on card ${inlineCard(data.card)}`
          dataText = `\n\n> "${action.data.text}"`

        } else if (action.type === 'updateCard') {
          if (action.display.translationKey === 'action_move_card_from_list_to_list') {
            actionText = `**moved** ${inlineCard(data.card)}`
            dataText = `from list *${action.data.listBefore.name}* to list *${action.data.listAfter.name}*`
          } else if (action.display.translationKey === 'action_archived_card') {
            actionText = `**archived** a card`
            dataText = displayCard(data)
          } else {
            actionText = '**updated** a card';
            dataText = displayCard(data);
          }

        } else if (action.type === 'updateCheckItemStateOnCard') {
          if (action.display.translationKey === 'action_completed_checkitem') {
            subject = `Done: ${subject}`
            actionText = `completed ${action.data.checkItem.name}`
            dataText = ``
            bot.reply(context, `${userName} updated **${action.data.checklist.name}** on card ["${action.data.card.name}"](http://www.trello.com/c/${action.data.card.shortLink})\n\n***Completed: "${action.data.checkItem.name}"***`)
            return;
          }
          if (action.display.translationKey === 'action_marked_checkitem_incomplete') {
            bot.reply(context, `${userName} updated **${action.data.checklist.name}** on card ["${action.data.card.name}"](http://www.trello.com/c/${action.data.card.shortLink})\n\n***Incomplete: "${action.data.checkItem.name}"***`)
            return;
          }
        }
        // only send an alert if we got an event we are listening to
        if (dataText) {
          const multiLine = dataText.split('\n\n').length > 1
          const reply = {
            markdown: `${multiLine ? '' : '> '}${subject} ${actionText} ${dataText}`,
            //text: `${multiLine ? '' : '> '}${subject} ${actionText} ${dataText}`,
          }
          bot.reply(context, reply);

        }

      } else {
        res.send(410).send()
      }
    })


  })
  // respond with 200 when setting up trello webhook
  webserver.head('/trello/receive', function(req, res) {
    res.sendStatus(200)
  })
}
