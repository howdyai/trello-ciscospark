var debug = require('debug')('trello:incoming_webhooks');

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
      channel: req.query.channel,
      action: action,
      user: action.memberCreator.fullName,
    }
    const webhookUuid = req.query.uuid

    controller.storage.channels.get(req.query.channel, (err, channel) => {

      if (!err && channel && channel.webhook && channel.webhook.uuid === webhookUuid) {
        res.status(200).send();

        switch(action.type) {

          case 'createCard':
            controller.trigger('trello_createCard', [bot, context, data]);
            break;
          case 'commentCard':
            controller.trigger('trello_commentCard', [bot, context, data]);
            break;
          case 'updateCard':
            switch (action.display.translationKey) {
              case 'action_move_card_from_list_to_list':
                controller.trigger('trello_moveCard', [bot, context, data]);
                break;
              case 'action_archived_card':
                controller.trigger('trello_archiveCard', [bot, context, data]);
                break;
              case 'action_moved_card_higher':
                controller.trigger('trello_moveCardHigher', [bot, context, data]);
                break;
              case 'action_moved_card_lower':
              controller.trigger('trello_moveCardLower', [bot, context, data]);
              default:
              controller.trigger('trello_updateCard', [bot, context, data]);
                break;
            }
            break;
          case 'addChecklistToCard':
            controller.trigger('trello_checklistCreate', [bot, context, data]);
            break;
          case 'createCheckItem':
            controller.trigger('trello_checkItemCreate', [bot, context, data]);
              break;
          case 'updateCheckItemStateOnCard':
            switch (action.display.translationKey) {
              case 'action_completed_checkitem':
                controller.trigger('trello_checkItemComplete', [bot, context, data]);
                break;
              case 'action_marked_checkitem_incomplete':
                controller.trigger('trello_checkItemIncomplete', [bot, context, data]);
                break;
            }
            break;
        }

      } else {
       res.sendStatus(401);
      }
    })


  })


  // respond with 200 when setting up trello webhook
  webserver.head('/trello/receive', function(req, res) {
    res.sendStatus(200)
  })
}
