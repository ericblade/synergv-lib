const baseUris = {
    base: 'https://www.google.com/voice',
    mobileBase: 'https://www.google.com/voice/m',
    clientsBase: 'https://clients4.google.com/voice',
    accountsBase: 'https://accounts.google.com',
};

const tokenUris = {
    galx: `${baseUris.accountsBase}/ServiceLoginAuth`,
    // Ignore the next line because it's absolutely huge. Sorry. It works, though, at least for now.
    // eslint-disable-next-line
    xpc: `${baseUris.clientsBase}/xpc/?xpc=%7B%22cn%22%3A%225TA7lWvzJx%22%2C%22tp%22%3Anull%2C%22pru%22%3A%22https%3A%2F%2Fwww.google.com%2Fvoice%2Fxpc%2Frelay%22%2C%22ppu%22%3A%22https%3A%2F%2Fwww.google.com%2Fvoice%2Fxpc%2Fblank%2F%22%2C%22lpu%22%3A%22https%3A%2F%2Fclients4.google.com%2Fvoice%2Fxpc%2Fblank%2F%22%7D`,
};

const uriParams = {
    galx: {
        service: 'grandcentral',
        continue: baseUris.base,
        followup: baseUris.base,
        ltmpl: 'open',
    },
    mobileLogin: {
        Page: 'Reauth',
        GALX: '// Must replace with a GALX token when using',
        gxf: '// Probably need? a gxf token when using',
        continue: baseUris.base,
        followup: baseUris.base,
        service: 'grandcentral',
        ltmpl: 'open',
        _utf8: '&#9731;',
        bgresponse: 'js_disabled',
        pstMsg: '0',
        dnConn: '',
        checkConnection: '',
        checkedDomains: 'youtube',
    },
};

const methodUris = {
    login: `${baseUris.accountsBase}/signin/challenge/sl/password`,
    getBox: `${baseUris.base}/inbox/recent`,
};

module.exports = {
    baseUris,
    tokenUris,
    uriParams,
    methodUris,
};
