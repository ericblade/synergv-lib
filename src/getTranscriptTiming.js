// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const getTranscriptTiming = (id, tokens, callback) => {
    const params = {
        id,
    };
    postRequest(
        methodUris.getTranscriptTiming,
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

module.exports = getTranscriptTiming;
