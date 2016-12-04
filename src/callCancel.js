// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const callCancel = (tokens, callback) => {
    // TODO: Anyone know how to use any of the parameters here?
    const params = {
        outgoingNumber: '',
        forwardingNumber: '',
        cancelType: 'C2C',
    };
    postRequest(
        methodUris.callCancel,
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

module.exports = callCancel;
