// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const contactQuickAdd = (tokens, callback) => {
    const params = {

    };
    postRequest(
        methodUris.contactQuickAdd,
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

module.exports = contactQuickAdd;
