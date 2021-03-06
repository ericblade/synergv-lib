const getRequest = require('./getRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

// TESTED 10/29/16
// TODO: anything else in /xpc/ ?
// TODO: There are at least: clients4.google.com/voice/xpc/checkMessages, /voice/xpc/checkContacts, /voice/xpc/getContacts
// TODO: unrelated to this function, but MrGecko had code for the newer? contacts interface, it looks like: https://github.com/GRMrGecko/VoiceMac/blob/610dc8126f10b676fda4d573fb1983f9f17c248e/Classes/VoiceBase/AddressBook/MGMGoogleContacts.m
// TODO: Probably does not work in Node, as the node.js login process does not implement the
// "xpc" parts of the login, currently

// TESTED 11/02/16
// WORKING!
// {"ok":true,"data":{"unreadCounts":{"all":3,"inbox":3,"missed":1,"placed":0,"received":0,"recorded":0,"sms":1,"spam":0,"starred":0,"trash":0,"unread":3,"voicemail":1}}}

// also discovered you don't need to go through all the /xpc/ token stuff to get this, you can just
// call $baseurl/checkMessages .. heh

const checkMessages = (tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        getRequest(
            methodUris.checkMessages,
            // `${methodUris.checkMessages}?r=${encodeURIComponent(tokens.r)}`, // for the XPC method
            {
                params: {
                },
                options: {
                    tokens,
                    responseType: 'json',
                },
            },
            resp => resolve(resp)
        );
    });
};

module.exports = checkMessages;
