// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const generalSettings = (tokens, callback) => {
    const params = {
    };
    postRequest(
        methodUris.generalSettings,
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

module.exports = generalSettings;
