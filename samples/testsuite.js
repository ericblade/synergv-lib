const VERSION = '0.0.8';

const login = require('./login');
const getBillingCredit = require('..').getBillingCredit;
const getBox = require('..').getBox;
const sendMessage = require('..').sendMessage;
const deleteForever = require('..').deleteForeverMessage;
const archiveMessages = require('..').archiveMessages;
const blockMessage = require('..').blockMessage;
const deleteMessage = require('..').deleteMessage;
const markRead = require('..').markRead;

const tokenStore = require('..').tokenStore;

console.log(`**** synergv-lib test suite v${VERSION}`);

let gcData = {};
let testId = null;

function testTokens(args) {
    gcData = args[0];
    const tokens = tokenStore.getTokens();
    console.log('**** testing tokens');
    if (!tokens.GALX) {
        throw new Error('No GALX token received');
    }
    if (!tokens.gxf) {
        throw new Error('No gxf token received');
    }
    if (!tokens.rnr) {
        throw new Error('No rnr token received');
    }
    console.log('**** GALX, gxf, rnr token located');
    if (!gcData.number || !gcData.number.raw) {
        throw new Error('Unable to locate phone number in gcData.number.raw');
    }
    console.log(`**** Google Voice Phone Number: ${gcData.number.raw}`);
    return gcData;
}

function sendTestMessage() {
    console.log(`**** sending test message from ${gcData.number.raw} to self for further testing.`)
    return sendMessage({ recp: gcData.number.raw, text: 'TEST SUITE MESSAGE' });
}

function testResultIsOk(result) {
    if (result.ok !== true) {
        throw new Error('Failed. err=', result);
    } else {
        console.warn('**** Result OK: true');
        return true;
    }
}

function retrieveTestMessageFromInbox() {
    console.warn('**** Searching for test messages');
    return new Promise((resolve, reject) => {
        getBox({ label: 'inbox', p: 1 })
        .then((conversations) => {
            const results = [];
            for (c in conversations) {
                const conv = conversations[c];
                if (conv.messageText === 'TEST SUITE MESSAGE' && conv.phoneNumber === gcData.number.raw) {
                    results.push(conv);
                }
            }
            resolve(results);
        }).catch((err) => {
            throw new Error({ error: 'Error retrieving inbox?!', err });
        });
    })
}

function checkTestMessageCount(count) {
    return retrieveTestMessageFromInbox()
        .then((convs) => {
            if (convs.length === count) {
                console.warn(`**** inbox test message count is expected ${count}`);
                return convs;
            } else {
                throw new Error(`Expected ${count} test message conversation, found ${convs.length}`);
                return false;
            }
        });
}

console.log('**** Logging in to retrieve tokens');

login.login()
.then((...args) => testTokens(args))
.then(() => {
    console.warn('**** Testing getBillingCredit');
    return getBillingCredit();
})
.then((billingCredit) => {
    testResultIsOk(billingCredit);
    console.warn('**** billingCredit: ', billingCredit);
})
.then(() => retrieveTestMessageFromInbox(gcData.number.raw)) // check for existing test messages
.then((existingTests) => {
    if (existingTests.length) { // delete them permanently if found
        console.warn('**** Deleting existing test messages from inbox', existingTests);
        const existingTestIds = existingTests.map((conv) => conv.id);
        const promise = deleteForever(existingTestIds, true)
            .then(retrieveTestMessageFromInbox(gcData.number.raw)) // check that delete worked
            .then(stillExistingTests => {
                if (stillExistingTests.length) {
                    throw new Error('Test Messages still existing even after delete!');
                } else {
                    console.warn('**** Existing tests seem to have been deleted.');
                }
                return true;
            });
        return promise;
    } else {
        console.warn('**** No existing test messages found');
        return true;
    }
})
.then(() => sendTestMessage()) // test send message function
.then((resp) => testResultIsOk(resp))
.then(() => {
    console.warn('**** Waiting 3 seconds for message to appear in Inbox');
    return new Promise( (resolve, reject) => {
        setTimeout(() => resolve(checkTestMessageCount(1)), 3000);
    });
})
.then((testIds) => {
    console.warn(`**** New Test Message Conversation Id: ${testIds[0]}`);
    testId = testIds[0].id;
    return true;
})

.then(() => { // test Archive
    console.warn('**** Archiving');
    return archiveMessages([testId], true);
})
.then((resp) => testResultIsOk(resp))
.then(() => checkTestMessageCount(0)) // TODO: This should be modded to check the "All" box for 1 test message, and verify it doesn't have the Inbox folder set.
.then(() => { // test Unarchive
    console.warn('**** Unarchiving');
    return archiveMessages([testId], false);
})
.then((resp) => testResultIsOk(resp))
.then(() => checkTestMessageCount(1))

.then(() => { // test Block
    console.warn('**** Blocking');
    return blockMessage([testId], true);
})
.then((resp) => testResultIsOk(resp))
.then(() => checkTestMessageCount(0)) // TODO: This should be modded to check the 'Spam' box for 1 test message, and check it's isSpam attribute
.then(() => { // test Unblock
    console.warn('**** Unblocking');
    return blockMessage([testId], false);
})
.then((resp) => testResultIsOk(resp))
.then(() => checkTestMessageCount(1))

.then(() => { // test Delete
    console.warn('**** Deleting');
    return deleteMessage([testId], true);
})
.then((resp) => testResultIsOk(resp))
.then(() => checkTestMessageCount(0)) // TODO: This should be modded to check the 'Trash' box for 1 test message and check it's isTrash attribute
.then(() => { // test Undelete
    console.warn('**** Undeleting');
    return deleteMessage([testId], false);
})
.then((resp) => testResultIsOk(resp))
.then(() => checkTestMessageCount(1))

.then(() => { // test Mark (read)
    console.warn('**** Marking Read');
    return markRead([testId], true);
})
.then((resp) => testResultIsOk(resp)) // TODO: Need to add a step after this that checks the "isRead" status on the message.
.then(() => { // test UnMark (unread)
    console.warn('**** Marking Unread');
    return markRead([testId], false);
})
.then((resp) => testResultIsOk(resp)) // TODO: Need to add a step after this that checks the "isRead" status on the message.

// how to test searchMessages? probably provide a search query for the test message, and validate that it ONLY has that message.
// TODO: Now that I'm thinking about it, we should do a searchMessages on that at the very top instead of a Inbox get,
// but I really want to get this code committed, so i'm writing that as a TODO for later.
// TODO: After Mark test checks the "isRead" status of the messages, copy that to perform the Star test, and make sure
// we test the "star" status (NOT "isStar" for some reason)

// TODO: Should also test that the "messages" array in the test conversation contains exactly two objects, and their contents as well!

// how to test vmDownload?!
// how to test restoreTranscript / saveTranscript ?
// how to test getPhoneInfo?
// how to test getTranscriptTiming?
// how to test saveNote/deleteNote ?
// how to test donate?
// how to test editDefaultForwarding?
// how to test forward?
// how to test generalSettings ?
// test call and callCancel just before
// test deleteForeverMessage last
.catch((err) => {
    console.error('**** Error during tests:', err);
    throw err;
});
