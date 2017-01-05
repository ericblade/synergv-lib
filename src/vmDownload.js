// TODO: Not tested.

// Request URL:https://www.google.com/voice/b/0/media/send_voicemail_ogg/POSOQSVQLPRTTZPSLVQTLKRNWOWKYPNSHHIZLSOI?read=0
// Request Method:GET

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
