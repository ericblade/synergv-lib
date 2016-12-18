// TODO: Not tested. Probably needs to share some code with getBox, since the returns
// should be identical.

const getRequest = require('./getRequest');
const methodUris = require('./uris').methodUris;

const searchMessages = (str, page, tokens, callback) => {
    getRequest(
        methodUris.searchMessages,
        {
            params: {
                q: str,
                page: `p${page || 1}`,
            },
            options: {
                tokens,
                responseType: 'document',
            },
        },
        callback
    );
};

module.exports = searchMessages;
