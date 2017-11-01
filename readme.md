# Trello Bot for Cisco Spark powered by Botkit

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

This project contains everything you need to deploy your own customizable Trello bot for your company in Cisco Spark.

This bot is built with [Botkit](https://botkit.ai). Botkit is designed to ease the process of designing and running useful, creative bots that live inside messaging platforms. Bots are applications that can send and receive messages, and in many cases, appear alongside their human counterparts as users.

### Bot Features
This bot gives access to all the important features of Trello, directly from within Cisco Spark, including:

* Add cards
* Search cards
* New comment notifications
* Checklist activity notifications
* Card update notifications

It also contains customizable routines for authorizing Trello access and associating Trello accounts with Cisco Spark accounts.

### What's Included
* [Botkit core](https://github.com/howdyai/botkit/blob/master/docs/readme.md#developing-with-botkit) - a complete programming system for building conversational software
* [Botkit Studio API](https://github.com/howdyai/botkit/blob/master/docs/readme-studio.md#function-index) - additional APIs that extend Botkit with powerful tools and APIs
* [Pre-configured Express.js webserver](https://expressjs.com/) including:
   * A customizable "Install my Bot" homepage
   * Webhook endpoints for communicating with Cisco Spark
   * Webhook endpoints for communicating with Trello
* A component that manages your app's Spark webhook subscriptions
* A component that provides access to the Trello API
* Interactive skills for adding and searching cards
* Event handlers for incoming notifications from Trello
* An onboarding skill for configuring the bot and authorizing Trello
* A help skill

### Getting Started

You will need a Cisco Spark developer account, and a Trello "App". Instructions to setup both are below.
Once the bot is up and running, the bot will send you a message in Spark to complete the configuration process.

#### Installing the Bot

[Remix this project on Glitch](https://glitch.com/edit/#!/import/github/howdyai/trello-ciscospark)

[Deploy to Heroku](https://heroku.com/deploy?template=https://github.com/howdyai/trello-ciscospark/master)

Clone this repository:

`git clone https://github.com/howdyai/trello-ciscospark.git`

Install dependencies

```
cd trello-ciscospark
npm install
```

#### Set up your Cisco Spark Application

First, create a .env file in the root folder of your bot project. Copy the `env.example` file as a template.

`cp env.example .env`

Then, set up a new Cisco Spark application via the [Cisco Spark developer portal](https://developer.ciscospark.com/). This is a multi-step process, but only takes a few minutes.

[Read this step-by-step guide](https://github.com/howdyai/botkit/blob/master/docs/provisioning/cisco-spark.md) to make sure everything is set up.

Once you've got your Spark bot token, update the `.env` file with your newly acquired tokens. This is your `access_token`.

Note: We recommend that you limit the bot's usage to only users at your company. Do this by adding your company's email domain to the whitelist on the bot controller in `bot.js`. You can also limit the bot to only be able to interact with users who are a part of your Spark Organization.

#### Set up your Trello App
Go to the [Trello app token](https://trello.com/app-key) page. Once logged in, copy the key at the top of the page, and the secret at the bottom of the page.
These are the `T_SECRET` and `T_KEY` values for your .env file.

#### Configuring the Bot
Edit the .env file and add the public address your bot will be running on as your `public_address`. See the note below for more info. If you're running on Glitch, it will be the name of your project, for example `https://example-project.glitch.me`

Add the email address you use for spark as the `admin_user`. This is Spark account the bot will message to complete the setup.

There are spark specific options to limit the bot to only work for users with an email address from your organizations domain.

> Note: Cisco Spark requires your application be available at an SSL-enabled endpoint. To expose an endpoint during development, we recommend using [ngrok](http://ngrok.io), to temporarily expose your bot to the internet. Once stable and published to the real internet, use nginx or another web server to provide an SSL-powered front end to your bot application.

#### Running the bot
After you have completed configuring your .env file, launch your bot application by typing:

`node .`

If everything is working then the bot will message your on Spark with further instructions!

Send `help` to the bot for an overview of its capabilities.


### Extend This Starter Kit

This starter kit is designed to provide developers a robust starting point for building a custom bot. Included in the code are a set of sample bot "skills" that illustrate various aspects of the Trello, Cisco Spark, and Botkit SDK features.  

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

# Developer & Support Community

You can find full documentation for Botkit on our [GitHub page](https://github.com/howdyai/botkit/blob/master/readme.md). Botkit Studio users can access the [Botkit Studio Knowledge Base](https://botkit.groovehq.com/help_center) for help in managing their account.

You can also find help from members of the Botkit team [in our dedicated Cisco Spark room](https://eurl.io/#SyNZuomKx)!

###  Need more help?
* Glitch allows users to ask the community for help directly from the editor! For more information on raising your hand, [read this blog post.](https://medium.com/glitch/just-raise-your-hand-how-glitch-helps-aa6564cb1685)

Come to ask questions, share your progress, and commune with your peers!

* We also host a [regular meetup and annual conference called TALKABOT.](http://talkabot.ai) Come meet and learn from other bot developers!

 [Full video of our 2016 event is available on Youtube.](https://www.youtube.com/playlist?list=PLD3JNfKLDs7WsEHSal2cfwG0Fex7A6aok)


# About Botkit

Botkit is a product of [Howdy](https://howdy.ai) and made in Austin, TX with the help of a worldwide community of botheads.
