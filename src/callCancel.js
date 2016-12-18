// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const callCancel = (tokens, callback) => {
    // gc.constants.CancelCallTypes = {CLICK_TO_CALL:"C2C", RECORDING:"RECORDING", VERIFY_FORWARDING:"VERIFY_FORWARDING"};
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
                responseType: 'document',
            },
        },
        callback
    );
};

module.exports = callCancel;
