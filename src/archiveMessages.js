const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;
const tokenStore = require('./tokenStore');

const archiveMessages = (messages, archive, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
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
            (resp) => resolve(resp)
        );
    });
};

module.exports = archiveMessages;
