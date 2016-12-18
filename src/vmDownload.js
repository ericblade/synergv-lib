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
                responseType: 'document',
            },
        },
        callback
    );
};

module.exports = vmDownload;
