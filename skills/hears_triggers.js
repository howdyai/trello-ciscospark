// Put all regex based input triggers in one place

module.exports = (controller) => {
  // Add a card with input as title
  controller.hears(['^add (.*)?$', '^add$'], 'direct_message,direct_mention', (bot, message) => {
    controller.trigger('addCard', [bot, message])
  })

  // Search board set to channel
  controller.hears(['^search(.*)?$'], 'direct_message,direct_mention', (bot, message) => {
    controller.trigger('searchBoard', [bot, message])
  })

  controller.hears('^help$', 'direct_message,direct_mention', function(bot, message) {
    controller.trigger('help', [bot, message])
  })

  // list all user boards
  controller.hears(['change board','boards','switch board'], 'direct_message,direct_mention', (bot, message) => {
    controller.trigger('selectBoard', [bot, message])
  })

}
