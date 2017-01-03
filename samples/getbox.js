const login = require('./login');
const getBox = require('..').getBox;

// provided by babelifying something that used the spread operator in a way node doesn't understand
const _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

login.login()
    .then(() => getBox({ label: 'inbox', p: 1 }))
    .then((inMessages) => {
        console.warn('**** messages received', inMessages);
        const metaData = inMessages.jsonData;
        const newMsgs = Object.values(metaData.messages).map((m, idx) => {
            // grab the "messages" subobject, parse out the actual messages
            // and the other data grabbed from the scraping, and stuff them backwards
            // a level where they make sense.
            // TODO: The library should stuff these backwards FOR us!

            if (!inMessages.messages[idx] || !inMessages.messages[idx][m.id]) {
                console.warn('**** Error!! message missing in input data', m.id);
                return {};
            }
            const parsedInfo = inMessages.messages[idx][m.id];

            const messages = parsedInfo.messages;
            const location = parsedInfo.location;
            const vmMessageLength = parsedInfo.vmMessageLength;
            const portrait = parsedInfo.portrait;

            return _extends({}, m, {
                messages,
                location,
                vmMessageLength,
                portrait,
                lastMessage: messages[messages.length - 1]
            });
        });
        console.warn('*** messages', newMsgs);
    }).catch((err) => {
        console.warn('**** ERROR RETRIEVING INBOX', err);
    });
