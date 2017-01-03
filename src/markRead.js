// Tested, working 18Dec2016

const postRequest = require('./postRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

const markRead = (messages, read, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
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
            (resp) => {
                resolve(resp);
            }
        );
    });
};

module.exports = markRead;
