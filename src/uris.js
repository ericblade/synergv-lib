const baseUris = {
    base: 'https://www.google.com/voice',
    clientsBase: 'https://clients4.google.com/voice',
    accountsBase: 'https://accounts.google.com',
};

// depends on baseUris being completed before it can be added to the list.
baseUris.mobileBase = `${baseUris.base}/m`;
baseUris.xpcBase = `${baseUris.clientsBase}/xpc`;
// relatively new calls are in /b/0 .. as well as some changed calls..
// TODO: should rename this to a better name...
// TODO: I remember reading that there was a new "send" call over in /b/0, but i can't seem
// to find it anymore .. and that it supported multiple recipients, possibly more than the normal
// 5 that the regular call (used to?) support.
baseUris.b0Base = `${baseUris.base}/b/0`;

const tokenUris = {
    galx: `${baseUris.accountsBase}/ServiceLoginAuth`,
    // Ignore the next line because it's absolutely huge. Sorry. It works, though, at least for now.
    // eslint-disable-next-line
    xpc: `${baseUris.xpcBase}/?xpc=%7B%22cn%22%3A%225TA7lWvzJx%22%2C%22tp%22%3Anull%2C%22pru%22%3A%22https%3A%2F%2Fwww.google.com%2Fvoice%2Fxpc%2Frelay%22%2C%22ppu%22%3A%22https%3A%2F%2Fwww.google.com%2Fvoice%2Fxpc%2Fblank%2F%22%2C%22lpu%22%3A%22https%3A%2F%2Fclients4.google.com%2Fvoice%2Fxpc%2Fblank%2F%22%7D`,
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
    checkContacts: `${baseUris.xpcBase}/checkContacts`,
    checkMessages: `${baseUris.xpcBase}/checkMessages`,
    getBillingCredit: `${baseUris.base}/settings/billingcredit/`,
    getBox: `${baseUris.base}/inbox/recent`,
    getContacts: `${baseUris.xpcBase}/getContacts`,
    getDoNotDisturb: `${baseUris.base}/settings/getDoNotDisturb/`,
    getPhoneInfo: `${baseUris.b0Base}/settings/tab/phones`,
    login: `${baseUris.accountsBase}/signin/challenge/sl/password`,
    sendMessage: `${baseUris.base}/sms/send/`, // note: i think this *requires* the / at the end
};

module.exports = {
    baseUris,
    tokenUris,
    uriParams,
    methodUris,
};
