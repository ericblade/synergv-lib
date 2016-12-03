const getRequest = require('./getRequest');
const methodUris = require('./uris').methodUris;

// TESTED 10/29/16
// { ok: true, data: { enabled: false } }

const getDoNotDisturb = (tokens, callback) => {
    getRequest(
        methodUris.getDoNotDisturb,
        {
            options: {
                tokens,
                responseType: 'json',
            },
        },
        callback
    );
};

module.exports = getDoNotDisturb;
