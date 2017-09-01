# Botkit-Spark Trello Bot

This repo contains everything you need to deploy your own Cisco Spark Trello bot built with [Botkit](https://botkit.ai).

Botkit is designed to ease the process of designing and running useful, creative bots that live inside messaging platforms. Bots are applications that can send and receive messages, and in many cases, appear alongside their human counterparts as users.

If you are looking to create a bot on other platforms using Glitch, check out the [Botkit project page](https://glitch.com/botkit).

### Getting Started

You will need a Cisco Spark developer account, and a Trello App. Instructions to setup both are below. Once the bot is configured properly and running, the bot will message you to complete the setup by logging in with your trello account.

#### Installing the Bot

[Remix this project on Glitch](https://glitch.com/edit/#!/import/github/howdyai/botkit-starter-ciscospark)

[Deploy to Heroku](https://heroku.com/deploy?template=https://github.com/howdyai/botkit-starter-ciscospark/master)

Clone this repository:

`git clone https://github.com/jonchurch/botkit-spark-trello.git`

Install dependencies

```
cd botkit-spark-trello
npm install
```

#### Set up your Cisco Spark Application 
Once you have setup your Botkit developer enviroment, the next thing you will want to do is set up a new Cisco Spark application via the [Cisco Spark developer portal](https://developer.ciscospark.com/). This is a multi-step process, but only takes a few minutes. 
Update the `.env` file with your newly acquired tokens.

[Read this step-by-step guide](https://github.com/howdyai/botkit/blob/master/docs/provisioning/cisco-spark.md) to make sure everything is set up. 

You can limit the bot's usage to only users at your company, by adding the domain to the whitelist on the bot controller in `bot.js`. You can also limit the bot to only be able to interact with users who are a part of your Spark Organization.

#### Set up your Trello App
Go to the [Trello app token](https://trello.com/app-key) page. Once logged in, copy the key at the top of the page, and the secret at the bottom of the page into your .env file.

#### Configuring the Bot
Edit the .env file and add the public address your bot will be running on as your `public_address`. See the note below for more info. If you're running on glitch, it will be the name of your project, for example `https://example-project.glitch.me`

Add the email address you use for spark as the `admin_user`. This is Spark account the bot will message to complete the setup.

There are spark specific options to limit the bot to only work for users with an email address from your organizations domain.

> Note: Cisco Spark requires your application be available at an SSL-enabled endpoint. To expose an endpoint during development, we recommend using [localtunnel.me](http://localtunnel.me) or [ngrok](http://ngrok.io), either of which can be used to temporarily expose your bot to the internet. Once stable and published to the real internet, use nginx or another web server to provide an SSL-powered front end to your bot application. 

#### Running the bot
After you have completed configuring your .env file, launch your bot application by typing:

`node .`

If everything is working then the bot will message your on spark with instructions to setup your Trello Organization and start adding boards to channels!

Send `help` to the bot for an overview of its capabilities


### Extend This Starter Kit

This starter kit is designed to provide developers a robust starting point for building a custom bot. Included in the code are a set of sample bot "skills" that illustrate various aspects of the Botkit SDK features.  Once you are familiar with how Botkit works, you may safely delete all of the files in the `skills/` subfolder.

Developers will build custom features as modules that live in the `skills/` folder. The main bot application will automatically include any files placed there.

A skill module should be in the format:

```
module.exports = function(controller) {

    // add event handlers to controller
    // such as hears handlers that match triggers defined in code
    // or controller.studio.before, validate, and after which tie into triggers
    // defined in the Botkit Studio UI.

}
```

Continue your journey to becoming a champion botmaster by [reading the Botkit Studio SDK documentation here.](https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md)


### Customize Storage

By default, the bot uses a simple file-system based storage mechanism to record information about the teams and users that interact with the bot. While this is fine for development, or use by a single team, most developers will want to customize the code to use a real database system.

There are [Botkit plugins for all the major database systems](https://github.com/howdyai/botkit/blob/master/docs/readme-middlewares.md#storage-modules) which can be enabled with just a few lines of code.

We have enabled our [Mongo middleware]() for starters in this project. To use your own Mongo database, just fill out `MONGO_URI` in your `.env` file with the appropriate information. For tips on reading and writing to storage, [check out these medium posts](https://botkit.groovehq.com/knowledge_base/categories/build-a-bot)

# Developer & Support Community

You can find full documentation for Botkit on our [GitHub page](https://github.com/howdyai/botkit/blob/master/readme.md). Botkit Studio users can access the [Botkit Studio Knowledge Base](https://botkit.groovehq.com/help_center) for help in managing their account.

###  Need more help?
* Glitch allows users to ask the community for help directly from the editor! For more information on raising your hand, [read this blog post.](https://medium.com/glitch/just-raise-your-hand-how-glitch-helps-aa6564cb1685)

* Join our thriving community of Botkit developers and bot enthusiasts at large. Over 4500 members strong, [our open Slack group](http://community.botkit.ai) is _the place_ for people interested in the art and science of making bots. 

You can also find help from members of the Botkit team [in our dedicated Cisco Spark room](https://eurl.io/#SyNZuomKx)!


 Come to ask questions, share your progress, and commune with your peers!

* We also host a [regular meetup and annual conference called TALKABOT.](http://talkabot.ai) Come meet and learn from other bot developers! 
 
 [Full video of our 2016 event is available on Youtube.](https://www.youtube.com/playlist?list=PLD3JNfKLDs7WsEHSal2cfwG0Fex7A6aok)


# About Botkit 

Botkit is a product of [Howdy](https://howdy.ai) and made in Austin, TX with the help of a worldwide community of botheads.
