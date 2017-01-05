/* eslint no-console: "off" */

const VERSION = '0.0.9';

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
    console.log(`**** sending test message from ${gcData.number.raw} to self for further testing.`);
    return sendMessage({ recp: gcData.number.raw, text: 'TEST SUITE MESSAGE' });
}

function testResultIsOk(result, echoResult = false) {
    if (result.ok !== true) {
        throw new Error('Failed. err=', result);
    } else {
        console.warn('**** Result OK: true');
        if (echoResult) {
            console.warn('**** Result was:', result);
        }
        return true;
    }
}

function testLabelNotPresent(conv, label) {
    if (conv.labels.indexOf(label) > -1) {
        throw new Error(`Expected conversation to not have label ${label}`);
    }
    console.warn(`**** Conversation does not contain label ${label} as expected`);
    return true;
}

function testConversationValue(conv, name, compareValue) {
    if (conv[name] !== compareValue) {
        throw new Error(`Expected variable ${name} to contain ${compareValue}, but it is ${conv[name]}`);
    }
    console.warn(`**** Conversation variable ${name} contains ${compareValue} as expected`);
}

function retrieveTestMessageFromBox(box = 'inbox') {
    console.warn(`**** Searching for test messages in box ${box}`);
    return new Promise((resolve, reject) => {
        getBox({ label: box, p: 1 })
        .then((conversations) => {
            const results = conversations.filter(c => c.messageText === 'TEST SUITE MESSAGE' && c.phoneNumber === gcData.number.raw);
            resolve(results);
        }).catch((err) => {
            throw new Error({ error: 'Error retrieving inbox?!', err });
        });
    });
}

function checkTestMessageCount(count, box = 'inbox') {
    return retrieveTestMessageFromBox(box)
        .then((convs) => {
            if (convs.length === count) {
                console.warn(`**** ${box} test message count is expected ${count}`);
                return convs;
            }
            throw new Error(`Expected ${count} test message conversation, found ${convs.length}`);
        });
}

function header(str) {
    console.warn(`**** ${str}`);
    return false;
}

function wait(time) {
    return new Promise(resolve => setTimeout(() => resolve(true), time));
}

console.log('**** Logging in to retrieve tokens');

login.login()
.then((...args) => testTokens(args))
.then(() => header('getBillingCredit') || getBillingCredit())
.then(resp => testResultIsOk(resp, true))
/*
 * Insert any tests that do NOT require having a conversation to work with ABOVE the following
 * section, before conversation tests begin.
 */
.then(() => retrieveTestMessageFromBox()) // check for existing test messages
.then((existingTests) => {
    if (existingTests.length) { // delete them permanently if found
        console.warn('**** Deleting existing test messages from inbox', existingTests);
        const existingTestIds = existingTests.map(conv => conv.id);
        const promise = deleteForever(existingTestIds, true)
            .then(retrieveTestMessageFromBox()) // check that delete worked
            .then((stillExistingTests) => {
                if (stillExistingTests.length) {
                    throw new Error('Test Messages still existing even after delete!');
                } else {
                    console.warn('**** Existing tests seem to have been deleted.');
                }
                return true;
            });
        return promise;
    }
    console.warn('**** No existing test messages found');
    return true;
})
.then(() => sendTestMessage()) // test send message function
.then(resp => testResultIsOk(resp, true))
.then(() => header('Waiting 3 seconds for message to appear in Inbox') || wait(3000))
.then(() => checkTestMessageCount(1))
.then((testConvs) => {
    console.warn(`**** New Test Message Conversation: ${testConvs[0]}`);
    console.warn(`**** There are ${testConvs[0].messages.length} messages in conversation.`);
    if (testConvs[0].messages.length !== 2) {
        console.warn('**** WARNING: Expected exactly 2 messages.This is a warning, not a failure.');
    }
    testConvs[0].messages.forEach((msg, index) => {
        console.warn(`Message #${index}:`, msg);
    });
    testId = testConvs[0].id;
    return true;
})
// begin all tests that require a conversation to work
.then(() => header('Archiving') || archiveMessages([testId], true))
.then(resp => testResultIsOk(resp))
.then(() => checkTestMessageCount(1, 'all'))
.then(convs => testLabelNotPresent(convs[0], 'Inbox'))
.then(() => header('Unarchiving') || archiveMessages([testId], false))
.then(resp => testResultIsOk(resp))
.then(() => checkTestMessageCount(1))

.then(() => header('Blocking') || blockMessage([testId], true))
.then(resp => testResultIsOk(resp))
.then(() => checkTestMessageCount(1, 'spam'))
.then(convs => testConversationValue(convs[0], 'isSpam', true))
.then(() => header('Unblocking') || blockMessage([testId], false))
.then(resp => testResultIsOk(resp))
.then(() => checkTestMessageCount(1))
.then(convs => testConversationValue(convs[0], 'isSpam', false))

.then(() => header('Delete') || deleteMessage([testId], true))
.then(resp => testResultIsOk(resp))
.then(() => checkTestMessageCount(1, 'trash'))
.then(convs => testConversationValue(convs[0], 'isTrash', true))
.then(() => header('Undelete') || deleteMessage([testId], false))
.then(resp => testResultIsOk(resp))
.then(() => checkTestMessageCount(1))
.then(convs => testConversationValue(convs[0], 'isTrash', false))

.then(() => header('Mark Read') || markRead([testId], true))
.then(resp => testResultIsOk(resp))
.then(() => checkTestMessageCount(1))
.then(convs => testConversationValue(convs[0], 'isRead', true))
.then(() => header('Mark UNread') || markRead([testId], false))
.then(resp => testResultIsOk(resp))
.then(() => checkTestMessageCount(1))
.then(convs => testConversationValue(convs[0], 'isRead', false))

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

/*
 * Add any new tests that involve operating on a message, above this comment.  The final test
 * should always be deleting the test message as a final cleanup.
 */
.then(() => header('Deleting Test Message Forever...') || deleteForever([testId], true))
.then(() => checkTestMessageCount(0))
.catch((err) => {
    console.error('**** Error during tests:', err);
    throw err;
});
