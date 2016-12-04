// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const deleteNote = (id, tokens, callback) => {
    const params = {
        id,
    };
    postRequest(
        methodUris.deleteNote,
        {
            params,
            options: {
                tokens,
                requestType: 'document',
            }
        },
        callback
    );
};

module.exports = deleteNote;
