const login = require('./login');
const getBox = require('..').getBox;
const markRead = require('..').markRead;

login.login()
    .then(() => getBox({ label: 'inbox', p: 1 })
    .then((inMessages) => {
        const metaData = inMessages.jsonData;
        const msgIds = Object.values(metaData.messages).map((m) => m.id);
        console.warn('**** Marking all conversations on page 1 of inbox read');
        console.warn('**** conversation ids=', msgIds);
        markRead(msgIds, true).then((resp) => {
            console.warn('**** markRead response=', resp);
        }).catch((err) => console.warn('**** markRead failed err=', err));
    }));
