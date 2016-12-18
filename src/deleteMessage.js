// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const deleteMessage = (messages, trash, tokens, callback) => {
    const params = {
        messages,
        trash,
    };
    postRequest(
        methodUris.deleteMessage,
        {
            params,
            options: {
                tokens,
                responseType: 'document',
            },
        },
        callback
    );
};

module.exports = deleteMessage;
