/* eslint no-console: "off" */

const VERSION = '0.0.12';
const TestPhoneName = 'My Cell'; // Change this to whatever the name of your phone is in settings

const login = require('./login');
const getBillingCredit = require('..').getBillingCredit;
const getBox = require('..').getBox;
const sendMessage = require('..').sendMessage;
const deleteForever = require('..').deleteForeverMessage;
const archiveMessages = require('..').archiveMessages;
const blockMessage = require('..').blockMessage;
const deleteMessage = require('..').deleteMessage;
const markRead = require('..').markRead;

const saveNote = require('..').saveNote;
const deleteNote = require('..').deleteNote;

const getTranscriptTiming = require('..').getTranscriptTiming;
const saveTranscript = require('..').saveTranscript;
const restoreTranscript = require('..').restoreTranscript;

const getPhoneInfo = require('..').getPhoneInfo;
const callNumber = require('..').callNumber;
const callCancel = require('..').callCancel;

const tokenStore = require('..').tokenStore;

console.log(`**** synergv-lib test suite v${VERSION}`);

const testMessageText = 'TEST SUITE MESSAGE';

let gcData = {}; // filled in from login
let testId = null; // filled in from retrieval of inbox test message, or voicemail test message
let vmTranscriptText = ''; // filled in during voicemail Transcript testing, stores original transcription
let testPhoneInfo = {}; // filled in from getTestPhoneInfo
let testCallId = ''; // filled in from callNumber test

function getTestPhoneInfo() {
    return new Promise((resolve, reject) => {
        console.warn(`**** getPhoneInfo searching for phone called ${TestPhoneName}`);
        getPhoneInfo()
        .then((phoneData) => {
            const testPhones = phoneData.filter(p => p.name === TestPhoneName);
            if (testPhones.length === 0) {
                throw new Error('No test phones found');
            }
            console.warn('**** found phone', testPhones[0]);
            testPhoneInfo = testPhones[0];
            resolve(testPhoneInfo);
        });
    });
}
function testTokens(args) {
    gcData = args.gcData;
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
    return sendMessage({ recp: gcData.number.raw, text: testMessageText });
}

function testResultIsOk(result, echoResult = true) {
    if (result.ok !== true) {
        throw new Error(`Failed. err=${JSON.stringify(result)}`);
    }
    console.warn('**** Result OK: true');
    if (echoResult) {
        console.warn('**** Result was:', result);
    }
    return result;
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
    if (name === '') {
        name = '(empty string)';
    }
    console.warn(`**** Conversation variable ${name} contains ${compareValue} as expected`);
}

function retrieveTestMessageFromBox(box = 'inbox') {
    console.warn(`**** Searching for test messages in box ${box}`);
    return new Promise((resolve, reject) => {
        getBox({ label: box, p: 1 })
        .then((conversations) => {
            const results = conversations.filter(c => c.messageText === testMessageText && c.phoneNumber === gcData.number.raw);
            resolve(results);
        }).catch((err) => {
            throw new Error({ error: 'Error retrieving inbox?!', err });
        });
    });
}

function retrieveVoiceMailConversation() {
    console.warn('**** Searching for a Voicemail item');
    return new Promise((resolve, reject) => {
        getBox({ label: 'voicemail', p: 1 })
        .then((conversations) => {
            if (conversations.length === 0) {
                throw new Error('Unable to proceed with Voicemail tests, no voicemails found.');
            } else {
                resolve(conversations[0]);
            }
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
.then(args => testTokens(args))

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

.then(() => header('Save Note') || saveNote(testId, testMessageText))
.then(resp => testResultIsOk(resp))
.then(() => checkTestMessageCount(1))
.then(convs => testConversationValue(convs[0], 'note', testMessageText))
.then(() => header('Delete Note') || deleteNote(testId))
.then(resp => testResultIsOk(resp))
.then(() => checkTestMessageCount(1))
.then(convs => testConversationValue(convs[0], 'note', ''))

// how to test searchMessages? probably provide a search query for the test message, and validate that it ONLY has that message.
// TODO: Now that I'm thinking about it, we should do a searchMessages on that at the very top instead of a Inbox get,
// but I really want to get this code committed, so i'm writing that as a TODO for later.
// TODO: After Mark test checks the "isRead" status of the messages, copy that to perform the Star test, and make sure
// we test the "star" status (NOT "isStar" for some reason)

// TODO: Should also test that the "messages" array in the test conversation contains exactly two objects, and their contents as well!

// how to test vmDownload?!
// how to test getPhoneInfo?
// how to test saveNote/deleteNote ?
// TODO: how to test donate? I do not see any information in the meta data that changes when "donate" is triggered.  Need to examine more carefully.
// how to test editDefaultForwarding?
// how to test forward?
// how to test generalSettings ?
// TODO: where to test callNumber and callCancel?

/*
 * Add any new tests that involve operating on a message, above this comment.  The final test
 * should always be deleting the test message as a final cleanup.
 */
.then(() => header('Deleting Test Message Forever...') || deleteForever([testId], true))
.then(() => checkTestMessageCount(0))
/*
 * Begin Voicemail Tests -- Since we can't send a Voicemail from this code, we have to depend on
 * there being an already existing item in the Voicemail box.
 * Since these depend on an existing conversation, they should always be done absolutely last
 * as testing will abort at this point, if the conditions are not met (the conditions being, that
 * there is something available in the voicemail box)
 */
// TODO: "vmMessageLength" is always undefined when testing from node.  Not sure if this is an error in node specific code, an error in our handling, or if that field just doesn't exist anymore on the server.

.then(() => retrieveVoiceMailConversation())
.then((vmConv) => {
    testId = vmConv.id;
    vmTranscriptText = vmConv.messageText;
    console.warn('**** Voicemail found: ', vmConv);
})

// TODO: getTranscriptTiming does NOT work, I do not know how to get it to work, and I don't know
// how to trigger it from the real website. :-S

// .then(() => header('getTranscriptTiming') || getTranscriptTiming([testId]))
// .then((resp) => {
//     console.warn('**** getTranscriptTiming response', resp);
// })
.then(() => header('saveTranscript') || saveTranscript(testId, testMessageText))
.then(resp => testResultIsOk(resp))
.then(() => retrieveVoiceMailConversation()) // TODO: since we depend on the test voicemail being the top one in the list, receiving a voicemail during this process could cause failures. Should search for the id, to test, but the odds of this occurring are very low, so no big deal.
.then(vmConv => testConversationValue(vmConv, 'messageText', testMessageText))
.then(() => header('restoreTranscript') || restoreTranscript(testId))
.then(resp => testResultIsOk(resp))
.then(() => retrieveVoiceMailConversation()) // TODO: see above TODO
.then(vmConv => testConversationValue(vmConv, 'messageText', vmTranscriptText))

/*
 * Test Phone Call Functions -- These require a forwarding phone, and we cannot validate that they
 * work beyond the service responding that they did -- which it does, as long as the inputs that
 * you give these functions are valid at a glance.  So, your forwarding phone will ring, and then
 * it will stop ringing a few moments later, if the tests are successful.
 */
.then(() => getTestPhoneInfo())
.then(() => header(`callNumber 909-390-0003 DO NOT ANSWER ${testPhoneInfo.phoneNumber}!`) || callNumber('+19093900003', testPhoneInfo.phoneNumber, testPhoneInfo.type))
.then(resp => testResultIsOk(resp, true))
// eslint-disable-next-line
.then(resp => testCallId = resp.data.callId)
.then(() => header('Waiting 10 seconds for phone to ring...') || wait(10000))
.then(() => header(`callCancel callId=${testCallId}`) || callCancel(testCallId))
.then((resp) => {
    console.warn(`**** callCancel results (ok: false is NORMAL here) ${JSON.stringify(resp)}`);
})
.catch((err) => {
    console.error('**** Error during tests:', err);
    throw err;
});
