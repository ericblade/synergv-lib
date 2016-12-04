// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const deleteForeverMessage = (messages, trash, tokens, callback) => {
    const params = {
        messages,
        trash,
    };
    postRequest(
        methodUris.deleteForeverMessage,
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

module.exports = deleteForeverMessage;
