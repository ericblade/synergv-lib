// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const archiveMessages = (messages, archive, tokens, callback) => {
    const params = {
        messages,
        archive,
    };
    postRequest(
        methodUris.archiveMessages,
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

module.exports = archiveMessages;
