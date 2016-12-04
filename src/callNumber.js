// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const callNumber = (outgoingNumber, forwardingNumber, phoneType, tokens, callback) => {
    const params = {
        outgoingNumber,
        forwardingNumber,
        phoneType,
    };
    postRequest(
        methodUris.callNumber,
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

module.exports = callNumber;
