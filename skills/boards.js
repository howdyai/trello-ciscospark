var debug = require('debug')('trello:boards');

module.exports = (controller) => {

  // list all user boards
  controller.on('selectBoard', (bot, message) => {

    debug('Bot started selectBoard handler!');

    bot.trello.getBoards()
      .then(data => {
        if (data.length) {
          const boards = data.map((el, i) => {
            return {
              index: `${i + 1}`,
              display: `\n\n\`${i + 1}:\` ${el.name}`,
              url: el.url,
              id: el.id,
              name: el.name,
              lists: el.lists
            }
          })
          const displayBoards = boards.reduce((a, b, c) => `${a}\n\n> \`${b.index}:\` ${b.name}`, '')

          bot.createConversation(message, (err, convo) => {

            // set up a conversation to collect the BOARD
            convo.addQuestion(`Choose the Trello board that should be linked to this Space.\n\n*Reply with a number from the list:* ${displayBoards}`, [{
                pattern: /^[\d]+$/,
                callback: (res, convo) => {
                  const board = boards.find(el => el.index == res.text)
                  if (board) {
                    const lists = board.lists.map((el, i) => {
                      return {
                        index: `${i + 1}`,
                        display: `\n\n\`${i + 1}:\` ${el.name}`,
                        id: el.id,
                        name: el.name,
                      }
                    })
                    board.lists = lists
                    convo.setVar('board', board)
                    if (!board.lists.length) {
                      convo.gotoThread('error_no_lists');
                    } else {
                      convo.setVar('lists', lists)
                      convo.setVar('displayList', lists.reduce((a, b, c) => `${a}\n\n> \`${b.index}:\` ${b.name}`, ''))
                      const displayList = lists.reduce((a, b, c) => `${a}\n\n> \`${b.index}:\` ${b.name}`, '')

                      convo.gotoThread('setList')
                    }
                  } else {
                    convo.gotoThread('error_in_board');
                  }
                }
              },
              {
                pattern: bot.utterances.quit,
                callback: function(res, convo) {
                    convo.gotoThread('quit');
                }
              },
              {
                default: true,
                callback: (res, convo) => {
                  convo.gotoThread('error_in_board');
                }
              }
            ])


            // set up a conversation to collect the LIST
            convo.addQuestion("Choose the list to use when adding new cards to **{{{vars.board.name}}}**. \n\n*Reply with a number from the list:* {{{vars.displayList}}}", [{
                pattern: /^[\d]+$/,
                callback: (res, convo) => {
                  const list = convo.vars.lists.find(el => el.index == res.text)
                  if (list) {
                    convo.setVar('list', list)
                    if (message.trello_channel && message.trello_channel.webhook) {
                      // update current webhook with trello if it exists, so we dont have zombie webhooks
                      bot.trello.updateBoardWebhook({
                        webhook: message.trello_channel.webhook,
                        boardId: convo.vars.board.id,
                        listId: list.id,
                        channel: message.channel,
                      }).then(data => {

                        controller.storage.channels.save({
                          id: message.channel,
                          board: convo.vars.board,
                          list: list,
                          webhook: data
                        }, (err, channel) => {
                          controller.debug('UPDATED CHANNEL:', channel)
                          convo.gotoThread('confirm')
                        })
                      }).catch(err => console.err(err))
                    } else {
                      // if no webhook exists for this channel, create one
                      bot.trello.registerBoardWebhook({
                        boardId: convo.vars.board.id,
                        channel: message.channel
                      }).then(webhook => {
                        controller.storage.channels.save({
                          id: message.channel,
                          board: convo.vars.board,
                          list: list,
                          webhook: webhook
                        }, (err, channel) => {
                          if (err) debug('Error saving webhook for channel', err)

                          else {
                            debug('SAVED CHANNEL: ', channel)
                            convo.gotoThread('confirm')
                          }
                        })
                      }).catch(err => debug(`Error registering trello webhook for channel ${message.channel}`, err.message))
                    }

                  } else {
                    convo.gotoThread('error_in_list');
                  }
                }
              },
              {
                pattern: bot.utterances.quit,
                callback: function(res, convo) {
                    convo.gotoThread('quit');
                }
              },
              {
                default: true,
                callback: (res, convo) => {
                  convo.gotoThread('error_in_list');
                }
              }
            ], {}, 'setList')

            // set up a confirmation message that is displayed when the process is complete.
            convo.addMessage("Okay! This space is now linked to [{{vars.board.name}}]({{{vars.board.url}}}) on Trello:\n\n* Add new cards by saying `add` or `add: card title`\n* New cards will be added to the `{{vars.list.name}}` list.\n\nTo change this setting, tell me `change boards`", 'confirm')

            // set up a thread to handle a bad response to the board selection.
            convo.addMessage({
              text: "Sorry, I did not understand which board you want to select.",
              action: 'default'
            }, 'error_in_board');

            // set up a thread to handle a bad response to the board selection.
            convo.addMessage({
              text: "Sorry, I did not understand which list you want to select.",
              action: 'setList'
            }, 'error_in_list');

            // set up a thread to handle a quit
            convo.addMessage({
              text: "OK! You can configure this option later when you are ready to use Trello.",
              action: 'stop'
            }, 'quit');

          convo.addMessage({
            text: "Looks like [**{{vars.board.name}}**]({{vars.board.url}}) doesn't have any lists yet. Create a list on the board and try setting it up again.",
            action: 'stop',
          }, 'error_no_lists');


            // start the process in motion!
            convo.activate()
          })


        } else {
          bot.reply(message, "There are no open boards available in your organization, please add a board on Trello.")

        }
      })
  })
}
