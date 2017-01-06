const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;
const tokenStore = require('./tokenStore');

const blockMessage = (messages, blocked, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        const params = {
            messages,
            blocked: blocked ? 1 : 0,
        };
        postRequest(
            methodUris.blockMessage,
            {
                params,
                options: {
                    tokens,
                    responseType: 'json',
                },
            },
            (resp) => resolve(resp)
        );
    });
};

module.exports = blockMessage;
