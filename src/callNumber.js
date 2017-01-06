const postRequest = require('./postRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

const callNumber = (outgoingNumber, forwardingNumber, phoneType, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        const params = {
            outgoingNumber,
            forwardingNumber,
            phoneType,
            // subscriberNumber: gcData.number.raw, ???
            // remember: 0
        };
        postRequest(
            methodUris.callNumber,
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

module.exports = callNumber;
