module.exports = function(controller) {


  controller.middleware.receive.use(function(bot, message, next) {

    console.log('RCVD: ', message.type, message.text);
    next();

  });

  controller.middleware.send.use(function(bot, message, next) {

    console.log('SEND: ', message.text);
    next();
  });




}
