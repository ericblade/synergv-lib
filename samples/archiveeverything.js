const login = require('./login');
const getBox = require('..').getBox;
const archiveMessages = require('..').archiveMessages;

login.login(() => {
    getPage().then(({metaData, msgIds}) => {
        const inboxSize = metaData.totalSize;
        const pages = Math.ceil(metaData.totalSize / metaData.resultsPerPage);
        console.warn(`**** Archiving ${pages} pages of messages...`);
        allMsgIds = msgIds;
        let retrievedPages = 1;
        const pagePromises = [];

        let i = pages;
        while(i--) { // you have to go backwards through the list so your page numbers don't get all screwed up by archiving the first ones first.
            pagePromises.push(getPage.bind(this, i));
        }
        pagePromises.reduce( (p, fn, ...rest) => p.then(fn), Promise.resolve() ).then(() => {
            console.warn('**** completed!');
        });
    });
});

function getPage(p=1) {
    return new Promise((resolve, reject) => {
        getBox({ label: 'inbox', p }, login.tokens, (inMessages) => {
            const metaData = inMessages.jsonData;
            const msgIds = Object.values(metaData.messages).map((m) => m.id);
            if (msgIds.length === 0) {
                resolve({ metaData, msgIds, page: p });
                return;
            }
            archiveMessages(msgIds, true, login.tokens, (resp) => {
                console.warn('**** archive response=', resp);
                resolve({ metaData, msgIds, page: p });
            });
        });
    });
}