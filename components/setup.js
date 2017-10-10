module.exports = (controller) => {

  const bot = controller.spawn({})

  // Check on startup if trello is set up for the team, trigger trello setup if not
  controller.storage.config.get().then(config => {
    if (!config.token) {
      controller.trigger('setupTrello', [bot])
    }
  })


}
