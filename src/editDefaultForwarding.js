// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const editDefaultForwarding = (tokens, callback) => {
    const params = {

    };
    postRequest(
        methodUris.editDefaultForwarding,
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

module.exports = editDefaultForwarding;
