// TODO: Not tested.

// Request URL:https://www.google.com/voice/b/0/inbox/donate/
// Request Method:POST
// Status Code:200

// donate:0
// messages:POSOQSVQLPRTTZPSLVQTLKRNWOWKYPNSHHIZLSOI
// _rnr_se

const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

const donate = (messages, donateBool, tokens, callback) => {
    const params = {
        messages,
        donate: donateBool,
    };
    postRequest(
        methodUris.donate,
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

module.exports = donate;
