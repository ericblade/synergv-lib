// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const starMessage = (messages, star, tokens, callback) => {
    const params = {
        messages,
        star,
    };
    postRequest(
        methodUris.starMessage,
        {
            params,
            options: {
                tokens,
                requestType: 'document',
            },
        },
        callback
    );
};

module.exports = starMessage;
