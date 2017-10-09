module.exports = (controller) => {
  // list all user orgs
  controller.on('listOrgs', (bot, message) => {
    bot.trello.listOrgs().then((data) => {
      const orgList = data.map((el, i) => `\n\n**${i}:** ${el.displayName}`).join('')
      bot.reply(message, "**Organizations you belong to:**" + orgList)
    })
  })
}
