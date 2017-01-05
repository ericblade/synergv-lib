// TODO: Not tested.

const getRequest = require('./getRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

const getTranscriptTiming = (id, tokens = tokenStore.getTokens()) => {
    console.warn('**** getTranscriptTiming tokens', tokens);
    return new Promise((resolve, reject) => {
        const params = {
            id,
        };
        getRequest(
            methodUris.getTranscriptTiming,
            {
                params,
                options: {
                    // tokens,
                    responseType: '',
                },
            },
            resp => resolve(resp)
        );
    });
};

module.exports = getTranscriptTiming;
