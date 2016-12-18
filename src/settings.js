// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const settings = (tokens, callback) => {
    const params = {

    };
    postRequest(
        methodUris.settings,
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

module.exports = settings;
