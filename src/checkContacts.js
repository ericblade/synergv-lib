const getRequest = require('./getRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

// TODO: Investigate why getRequest params block isn't ending up in the URI as a get parameter. wat?
// TESTED 11/2/16, working, returns a number that appears to be a timestamp. Perhaps the last time
// contacts were updated? Do an occasional checkContacts, then when the number changes, do a
// getContacts?  Not real sure. Mine returns time very close to right now, but I've only currently
// tested it in conjunction with getContacts ...

const checkContacts = (tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        getRequest(
            `${methodUris.checkContacts}?r=${encodeURIComponent(tokens.r)}`,
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

module.exports = checkContacts;
