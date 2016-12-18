// Tested 18Dec2016

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const archiveMessages = (messages, archive, tokens, callback) => {
    const params = {
        messages,
        archive: archive ? 1 : 0,
    };
    postRequest(
        methodUris.archiveMessages,
        {
            params,
            options: {
                tokens,
                responseType: 'json',
            },
        },
        callback
    );
};

module.exports = archiveMessages;
