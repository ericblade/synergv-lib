// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const donate = (messages, donateBool, tokens, callback) => {
    const params = {
        messages,
        donate: donateBool,
    };
    postRequest(
        methodUris.donate,
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

module.exports = donate;
