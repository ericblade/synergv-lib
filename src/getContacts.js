const getRequest = require('./getRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

// { ok: true, data: { contactPhones: { huge object }, contacts: { huge object }, hasContactCustomForwarding: false, hasGroupCustomForwarding: false }}

// TODO: Last I knew, getRequest() wasn't working when given params, which is why the URLs for
// all the xpc functions have the encodeURIComponent in them here.  This should be fixed, and
// then the checkContacts, checkMessages, getContacts functions need to have their
// encodeURIComponent calls removed, since that should be handled automatically in getRequest

// might be same as $baseurl/phonebook/getall
const getContacts = (tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        getRequest(
            `${methodUris.getContacts}?r=${encodeURIComponent(tokens.r)}`,
            {
                params: {
                    r: tokens.r,
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

module.exports = getContacts;
