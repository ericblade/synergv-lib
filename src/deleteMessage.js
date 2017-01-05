// TODO: Not tested.

const postRequest = require('./postRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

const deleteMessage = (messages, trash, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        const params = {
            messages,
            trash: trash ? 1 : 0,
        };
        postRequest(
            methodUris.deleteMessage,
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

module.exports = deleteMessage;
