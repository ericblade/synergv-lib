const login = require('./login');
const getBox = require('..').getBox;
const markRead = require('..').markRead;

login.login(() => {
    getBox({ label: 'inbox', p: 1 }, login.tokens, (inMessages) => {
        const metaData = inMessages.jsonData;
        const msgIds = Object.values(metaData.messages).map((m) => m.id);
        console.warn('**** Marking all conversations on page 1 of inbox read');
        console.warn('**** conversation ids=', msgIds);
        markRead(msgIds, true, login.tokens, (resp) => {
            console.warn('**** markRead response=', resp);
        });
    });
});
