const postRequest = require('./postRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

const callCancel = (callId, tokens = tokenStore.getTokens()) => {
    // gc.constants.CancelCallTypes = {CLICK_TO_CALL:"C2C", RECORDING:"RECORDING", VERIFY_FORWARDING:"VERIFY_FORWARDING"};
    return new Promise((resolve, reject) => {
        const params = {
            callId,
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
                    responseType: 'json',
                },
            },
            resp => resolve(resp)
        );
    });
};

module.exports = callCancel;
