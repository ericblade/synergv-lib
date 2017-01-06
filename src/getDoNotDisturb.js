const getRequest = require('./getRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

// { ok: true, data: { enabled: false } }

const getDoNotDisturb = (tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        getRequest(
            methodUris.getDoNotDisturb,
            {
                options: {
                    tokens,
                    responseType: 'json',
                },
            },
            resp => resolve(resp)
        );
    });
};

module.exports = getDoNotDisturb;
