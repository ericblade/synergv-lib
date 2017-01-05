// TODO: Tested 04Jan2017

const postRequest = require('./postRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

const deleteForeverMessage = (messages, trash, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
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
                    responseType: 'json',
                },
            },
            (resp) => resolve(resp)
        );
    });
};

module.exports = deleteForeverMessage;
