// TODO: Not tested.

const postRequest = require('./postRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

const restoreTranscript = (callId, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        const params = {
            callId,
        };
        postRequest(
            methodUris.restoreTranscript,
            {
                params,
                options: {
                    tokens,
                    responseType: 'json',
                },
            },
            resp => resolve(resp)
        );
    });
};

module.exports = restoreTranscript;
