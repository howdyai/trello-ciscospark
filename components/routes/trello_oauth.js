var OAuth = require('oauth').OAuth
var url = require('url')


module.exports = (webserver, controller) => {


    /*
    /     Routes
    */

    webserver.get("/login", function(request, response) {
        controller.log(`GET '/login' ð¤  ${Date()}`);
        login(request, response);
    });

    webserver.get("/callback", function(request, response) {
        controller.log(`GET '/callback' ð¤  ${Date()}`);
        callback(request, response);
    });

    /*
    /     OAuth Setup and Functions
    */
	const scope = "read,write,account";
	const expire = "never";
    const requestURL = "https://trello.com/1/OAuthGetRequestToken";
    const accessURL = "https://trello.com/1/OAuthGetAccessToken";
    const authorizeURL = "https://trello.com/1/authorize";
    const appName = "Trello Spark Bot";

    const key = process.env.T_KEY;
    const secret = process.env.T_SECRET;

    // Trello redirects the user here after authentication
    const loginCallback = `${process.env.public_address}/callback`

    const oauth_secrets = {};

    const oauth = new OAuth(requestURL, accessURL, key, secret, "1.0A", loginCallback, "HMAC-SHA1")

    const login = function(req, res) {
        const user = req.query.user
        const channel = req.query.channel
        oauth.getOAuthRequestToken(function(error, token, tokenSecret, results) {
            // controller.log(`in getOAuthRequestToken - user: ${user}, channel: ${channel}, token: ${token}, tokenSecret: ${tokenSecret}, resultes ${JSON.stringify(results)}, error: ${JSON.stringify(error)}`);
            oauth_secrets[token] = {
                tokenSecret,
                user,
                channel
            };
            res.redirect(`${authorizeURL}?scope=${scope}&expiration=${expire}&oauth_token=${token}&name=${appName}`);
        });
    };

    var callback = function(request, response) {
        const token = request.query.oauth_token;
        const secrets = oauth_secrets[token];
        const verifier = request.query.oauth_verifier;
        oauth.getOAuthAccessToken(token, secrets.tokenSecret, verifier, function(error, accessToken, accessTokenSecret, results) {
            // controller.log(`in getOAuthAccessToken - accessToken: ${accessToken}, accessTokenSecret: ${accessTokenSecret}, error: ${error}`);
            const data = {
                user: secrets.user,
                token: accessToken,
                channel: secrets.channel
            }
            var bot = controller.spawn({})
			response.redirect('/success.html')
            controller.trigger('oauthSuccess', [bot, data])
        });
    };


}
