// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const forward = (toAddress, subject, body, link, tokens, callback) => {
    const params = {
        toAddress,
        subject,
        body,
        link,
    };
    postRequest(
        methodUris.forward,
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

module.exports = forward;
