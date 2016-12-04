// TODO: Not tested.

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const saveNote = (id, note, tokens, callback) => {
    // TODO: Anyone know how to use any of the parameters here?
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
                requestType: 'document',
            },
        },
        callback
    );
};

module.exports = saveNote;
