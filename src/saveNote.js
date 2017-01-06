const postRequest = require('./postRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

const saveNote = (id, note, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        const params = {
            id,
            note,
        };
        postRequest(
            methodUris.saveNote,
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

module.exports = saveNote;
