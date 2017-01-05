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
    archiveMessages: `${baseUris.base}/inbox/archiveMessages`,
    blockMessage: `${baseUris.base}/inbox/block`,
    callCancel: `${baseUris.base}/call/cancel`,
    callNumber: `${baseUris.base}/call/connect`,
    checkContacts: `${baseUris.xpcBase}/checkContacts`,
    checkMessages: `${baseUris.xpcBase}/checkMessages`,
    contactQuickAdd: `${baseUris.base}/phonebook/quickAdd`,
    deleteForeverMessage: `${baseUris.base}/inbox/deleteForeverMessages`,
    deleteMessage: `${baseUris.base}/inbox/deleteMessages`,
    deleteNote: `${baseUris.base}/deletenote`,
    donate: `${baseUris.base}/inbox/donate`,
    editDefaultForwarding: `${baseUris.base}/settings/editDefaultForwarding`,
    forward: `${baseUris.base}/inbox/reply/`,
    generalSettings: `${baseUris.base}/settings/editGeneralSettings/`,
    getBillingCredit: `${baseUris.base}/settings/billingcredit/`,
    getBox: `${baseUris.base}/inbox/recent`,
    getContacts: `${baseUris.xpcBase}/getContacts`,
    getDoNotDisturb: `${baseUris.base}/settings/getDoNotDisturb/`,
    getPhoneInfo: `${baseUris.b0Base}/settings/tab/phones`,
    getTranscriptTiming: `${baseUris.base}/media/transcriptWords`,
    login: `${baseUris.accountsBase}/signin/challenge/sl/password`,
    markRead: `${baseUris.base}/inbox/mark`,
    rateTranscript: `${baseUris.base}/inbox/rateTranscript`,
    restoreTranscript: `${baseUris.base}/inbox/restoreTranscript`,
    saveNote: `${baseUris.base}/inbox/savenote`,
    saveTranscript: `${baseUris.base}/inbox/saveTranscript`,
    searchMessages: `${baseUris.base}/inbox/search`,
    sendMessage: `${baseUris.base}/sms/send`,
    settings: `${baseUris.base}/settings/tab/settings`,
    starMessage: `${baseUris.base}/inbox/star`,
    vmDownload: `${baseUris.base}/media/send_voicemail`,
};

module.exports = {
    baseUris,
    tokenUris,
    uriParams,
    methodUris,
};

// TODO: rateTranscript
// POST to /inbox/rateTranscript
// args: messages: [ msgIds ]
// rating: 1 (to rate as "useful"), 0 (to rate as "not useful")
// _rnr_se


// new discovery:
// https://accounts.google.com/accountLoginInfoXhr
// post to it, and receive some cryptic information about your account in JSON format:
//
// photo_url, name, email, shadow_email, encoded_profile_information, recovery_url, should_redirect_in_browser_drivefs, and action
//

// additional possible endpoints
/*
    VOICEMAIL:"/media/send_voicemail/",
    GREETING:"/media/send_greeting/",
    OUT_OF_SERVICE:"/media/sendOutOfServiceMessage",
    PHONEBOOK_NAME:"/media/sendPhonebookName/",
    SHARED_VOICEMAIL:"/media/svm/",
    SUBSCRIBER_NAME:"/media/sendRecordedName/",
    VOICEMAIL_OGG:"/media/send_voicemail_ogg/"

	APPEAL_SMS: gc.constants.APP_URI + "/sms/appeal",
	BILLING_CREDIT: gc.constants.APP_URI + "/settings/billingcredit/",
	BILLING_TRANS: gc.constants.APP_URI + "/settings/billingtrans/",
	CANCEL_ORDER: gc.constants.APP_URI + "/billing/cancelOrder/",
	CANCEL_PORT: gc.constants.APP_URI + "/porting/cancelPortIn/",
	CANCEL_UPGRADE_CLIENT: gc.constants.APP_URI + "/settings/cancelUpgradeClient",
	CHECK_CARRIER: gc.constants.APP_URI + "/settings/checkCarrier/",
	CHECK_CREDIT_ORDER: gc.constants.APP_URI + "/settings/checkCreditOrder/",
	CHECK_FOR_SHARING: gc.constants.APP_URI + "/settings/checkIllegalSharing",
	CHECK_FORWARDING_VERIFIED: gc.constants.APP_URI + "/settings/checkForwardingVerified",
	CHECK_FORWARDING_VERIFIED_NO_ACCOUNT: gc.constants.APP_URI + "/settings/checkVerifiedNoAccount",
	CHECK_MESSAGES: gc.constants.APP_URI + "/inbox/checkMessages/",
	CHECK_MOBILE_SETUP_OPTIONS: gc.constants.APP_URI + "/setup/checkMobileSetupOptions",
	CHECK_NUMBER_FOR_PORTING: gc.constants.APP_URI + "/porting/checkNumber",
	CHECK_SPAM_FILTER_ENABLED: gc.constants.APP_URI + "/settings/checkSpamFilterEnabled",
	CONTACT_DETAILS: gc.constants.APP_URI + "/call/contactdetails/",
	DELETE_FORWARDING: gc.constants.APP_URI + "/settings/deleteForwarding/",
	DIVERSION_CODE: gc.constants.APP_URI + "/settings/getDiversionCode",
	DIVERSION_CODE_COMPLETE: gc.constants.APP_URI + "/settings/diversionCodeComplete",
	EDIT_BILLING_SETTINGS: gc.constants.APP_URI + "/billing/editSettings/",
	EDIT_BUSINESS: gc.constants.APP_URI + "/settings/editOrg/",
	EDIT_CONTACT: gc.constants.APP_URI + "/contacts/editContact/",
	EDIT_FORWARDING: gc.constants.APP_URI + "/settings/editForwarding/",
	EDIT_FORWARDING_SMS: gc.constants.APP_URI + "/settings/editForwardingSms/",
	EDIT_GREETINGS: gc.constants.APP_URI + "/settings/editGreetings/",
	EDIT_GROUP: gc.constants.APP_URI + "/settings/editGroup/",
	EDIT_SETTINGS: gc.constants.APP_URI + "/settings/editGeneralSettings/",
	EDIT_TRANSCRIPT_STATUS: gc.constants.APP_URI + "/settings/editTranscriptStatus/",
	EDIT_VOICEMAIL_SMS: gc.constants.APP_URI + "/settings/editVoicemailSms/",
	FORCE_FORWARDING_VERIFIED: gc.constants.APP_URI + "/settings/setInVerification",
	GENERATE_EMBED_CODE: gc.constants.APP_URI + "/embed/generateEmbedTag",
	GET_CONTACT: gc.constants.APP_URI + "/contacts/getContactData/",
	GET_CONTACTS: gc.constants.APP_URI + "/phonebook/getall/",
	GET_NORMALIZED_NUMBER: gc.constants.APP_URI + "/setup/getNormalizedNumber/",
	HELP_TEXT: gc.constants.APP_URI + "/help/helpText/",
	NEW_NUMBER_SEARCH: gc.constants.APP_URI + "/setup/searchnew/",
	NEW_NUMBER_VANITY_SEARCH: gc.constants.APP_URI + "/setup/vanitysearchnew/",
	PORTING: gc.constants.APP_URI + "/porting",
	PORT_IN: gc.constants.APP_URI + "/porting/portIn",
	PORT_OUT_CHECKOUT: gc.constants.APP_URI + "/porting/portOutCheckout",
	PORT_SUPPLEMENT: gc.constants.APP_URI + "/porting/update",
	PURCHASE_NUMBER_CHANGE: gc.constants.APP_URI + "/settings/purchasenumberchange",
	PURCHASE_VANITY_NUMBER: gc.constants.APP_URI + "/setup/purchasevanitynumber",
	QUICK_ADD: gc.constants.APP_URI + "/phonebook/quickAdd/",
	RATE_CALL: gc.constants.APP_URI + "/inbox/ratecall/",
	RATE_TRANSCRIPT: gc.constants.APP_URI + "/inbox/rateTranscript/",
	RECORD_GREETING: gc.constants.APP_URI + "/call/recordGreeting/",
	RECORD_NAME: gc.constants.APP_URI + "/call/recordName/",
	RESERVE_DID: gc.constants.APP_URI + "/setup/reserve",
	SET_DO_NOT_DISTURB: gc.constants.APP_URI + "/settings/setDoNotDisturb/",
	SET_FORWARDING_ENABLED: gc.constants.APP_URI + "/settings/setForwardingEnabled/",
	SETUP_CREATE: gc.constants.APP_URI + "/setup/create/",
	SETUP_CREATE_CLIENT: gc.constants.APP_URI + "/setup/createclientonly/",
	SETUP_CREATE_VM: gc.constants.APP_URI + "/setup/createvm/",
	SETUP_SEARCH: gc.constants.APP_URI + "/setup/search/",
	SETUP_VANITY_SEARCH: gc.constants.APP_URI + "/setup/vanitysearch/",
	UNDO_CHANGE_DID: gc.constants.APP_URI + "/setup/undonumberchange",
	UNRESERVE_DID: gc.constants.APP_URI + "/setup/unreserve",
	UPGRADE_CLIENT: gc.constants.APP_URI + "/settings/upgradeClient",
	UPGRADE_LITE: gc.constants.APP_URI + "/settings/upgrade",
	VERIFY_FORWARDING: gc.constants.APP_URI + "/call/verifyForwarding"
*/
