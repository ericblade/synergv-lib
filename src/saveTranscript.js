// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const saveTranscript = (callId, trans, tokens, callback) => {
    // TODO: Anyone know how to use any of the parameters here?
    const params = {
        callId,
        trans,
    };
    postRequest(
        methodUris.saveTranscript,
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

module.exports = saveTranscript;
