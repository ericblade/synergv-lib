const login = require('./login');
const getBox = require('..').getBox;

login.login()
    .then(() => getBox({ label: 'inbox', p: 1 }))
    .then((inConv) => {
        console.warn('*** conversations', inConv);
    }).catch((err) => {
        console.warn('**** ERROR RETRIEVING INBOX', err);
    });
