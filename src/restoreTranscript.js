// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const restoreTranscript = (callId, tokens, callback) => {
    // TODO: Anyone know how to use any of the parameters here?
    const params = {
        callId,
    };
    postRequest(
        methodUris.restoreTranscript,
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

module.exports = restoreTranscript;
