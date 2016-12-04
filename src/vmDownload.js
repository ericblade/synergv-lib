// TODO: Not tested.

const getRequest = require('./getRequest');
const methodUris = require('./uris').methodUris;

const vmDownload = (messages, tokens, callback) => {
    const params = {
        messages,
    };
    getRequest(
        methodUris.vmDownload,
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

module.exports = vmDownload;
