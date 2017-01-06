const postRequest = require('./postRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

const deleteNote = (id, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        const params = {
            id,
        };
        postRequest(
            methodUris.deleteNote,
            {
                params,
                options: {
                    tokens,
                    responseType: 'json',
                },
            },
            resp => resolve(resp)
        );
    });
};

module.exports = deleteNote;
