// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const blockMessage = (messages, blocked, tokens, callback) => {
    const params = {
        messages,
        blocked,
    };
    postRequest(
        methodUris.blockMessage,
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

module.exports = blockMessage;
