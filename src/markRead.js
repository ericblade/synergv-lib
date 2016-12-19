// Tested, working 18Dec2016

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const markRead = (messages, read, tokens, callback) => {
    const params = {
        messages,
        read: read ? 1 : 0,
    };
    postRequest(
        methodUris.markRead,
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

module.exports = markRead;
