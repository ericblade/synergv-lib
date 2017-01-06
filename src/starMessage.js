const postRequest = require('./postRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

const starMessage = (messages, star, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        const params = {
            messages,
            star: star ? 1 : 0,
        };
        postRequest(
            methodUris.starMessage,
            {
                params,
                options: {
                    tokens,
                    responseType: 'json',
                },
            },
            resp => resolve(resp)
        );
    });
};

module.exports = starMessage;
