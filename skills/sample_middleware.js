module.exports = function(controller) {

     controller.middleware.receive.use((bot, message, next)=> {
		 controller.storage.channels.get(message.channel, (err, channel) => {
			 if (err) {
				 console.log('Err getting channel from storage: ', err)
				 next(err)
			 } else if (! channel) {
				 controller.trigger('selectBoard', [bot, message])
				 next()
			 } else {
				message.channel_config = channel 
				next();

				 /*controller.storage.users.get(message.user, (err, user) => {

				if (err) {
					console.log('Err getting user from storage: ', err)
					next(err)
				} else if (! channel) {
					controller.trigger('selectBoard', [bot, message])
					next()
				}

					})
				*/
			 }
		 })
     });
    
    //
    // controller.middleware.send.use(function(bot, message, next) {
    //
    //     // do something...
    //     console.log('SEND:', message);
    //     next();
    //
    // });

}
