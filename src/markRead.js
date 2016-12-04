// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const markRead = (messages, read, tokens, callback) => {
    const params = {
        messages,
        read,
    };
    postRequest(
        methodUris.markRead,
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

module.exports = markRead;
