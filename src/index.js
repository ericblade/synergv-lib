const archiveMessages = require('./archiveMessages');
const blockMessage = require('./blockMessage');
const callCancel = require('./callCancel');
const callNumber = require('./callNumber');
const checkContacts = require('./checkContacts');
const checkMessages = require('./checkMessages');
const contactQuickAdd = require('./contactQuickAdd');
const deleteForeverMessage = require('./deleteForeverMessage');
const deleteMessage = require('./deleteMessage');
const deleteNote = require('./deleteNote');
const donate = require('./donate');
const editDefaultForwarding = require('./editDefaultForwarding');
const getBillingCredit = require('./getBillingCredit');
const getBox = require('./getBox');
const getContacts = require('./getContacts');
const getDoNotDisturb = require('./getDoNotDisturb');
const getPhoneInfo = require('./getPhoneInfo');
const getTranscriptTiming = require('./getTranscriptTiming');
const login = require('./login');
const markRead = require('./markRead');
const restoreTranscript = require('./restoreTranscript');
const saveNote = require('./saveNote');
const saveTranscript = require('./saveTranscript');
const searchMessages = require('./searchMessages');
const sendMessage = require('./sendMessage');
const settings = require('./settings');
const tokenStore = require('./tokenStore');

module.exports = {
    archiveMessages,
    blockMessage,
    callCancel,
    callNumber,
    checkContacts,
    checkMessages,
    contactQuickAdd,
    deleteForeverMessage,
    deleteMessage,
    deleteNote,
    donate,
    editDefaultForwarding,
    getBillingCredit,
    getBox,
    getContacts,
    getDoNotDisturb,
    getPhoneInfo,
    getTranscriptTiming,
    login,
    markRead,
    restoreTranscript,
    saveNote,
    saveTranscript,
    searchMessages,
    sendMessage,
    settings,
    tokenStore,
};
