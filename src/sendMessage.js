const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;

// Original send: POST, Form Data:
// id: (conversationId)
// phoneNumber: +15551212
// conversationId: (conversationId)
// text: (message text)
// _rnr_se

// if you give it a valid conversationId, it will return a response that looks like:
// { ok: true, JSON: { ... a block containing the entire updated conversation! }, HTML: "a ton of junk i don't want to parse" }
// if you DON'T give it a conversationId, it will return:
// { ok: true, data: { code: 0 } }
// If given an invalid number (cannot possibly be used): (official client says "Invalid Number" when receiving)
// { ok: false, data: { code: 20 } }

// TESTED 02Dec2016 - works!

const sendMessage = (tokens, { recp, text, conversationId }, callback) => {
    const params = {
        phoneNumber: recp,
        text,
        id: conversationId || '',
        conversationId: conversationId || ''
    };
    postRequest(
        methodUris.sendMessage,
        {
            options: {
                tokens,
                responseType: 'json',
            },
            params,
        },
        callback
    );
};

module.exports = sendMessage;
