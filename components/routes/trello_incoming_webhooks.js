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

    debug('GOT POST TO /trello/receive', payload);


    controller.storage.channels.get(req.query.channel, (err, channel) => {

      debug('GOT RESPONSE FROM STORAGE', err, channel);

      if (!err && channel && channel.webhook && channel.webhook.uuid === webhookUuid) {
        debug('SENDING 200 response code');
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
                break;

              default:
                controller.trigger('trello_updateCard', [bot, context, data]);
                break;
            }
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

        debug('SENDING 401 response code');
       res.sendStatus(401);
      }
    })


  })


  // respond with 200 when setting up trello webhook
  webserver.head('/trello/receive', function(req, res) {
    debug('GOT HEAD REQUEST ON /trello/receive');
    res.sendStatus(200)
  })
}
