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
    // checkMessages: `${baseUris.xpcBase}/checkMessages`, // this one requires xpc token
    checkMessages: `${baseUris.base}/inbox/checkMessages/`,
    contactQuickAdd: `${baseUris.base}/phonebook/quickAdd`,
    deleteForeverMessage: `${baseUris.base}/inbox/deleteForeverMessages`,
    deleteMessage: `${baseUris.base}/inbox/deleteMessages`,
    deleteNote: `${baseUris.base}/inbox/deletenote`, // NOTE (har har): NOT a capital N in Note !!
    donate: `${baseUris.base}/inbox/donate`,
    editDefaultForwarding: `${baseUris.base}/settings/editDefaultForwarding`, // TODO: 403 on Post or Get
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
    saveNote: `${baseUris.base}/inbox/savenote`, // NOTE (har har): NOT a capital N in Note!!
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

	APPEAL_SMS: gc.constants.APP_URI + "/sms/appeal", // POST: 500, GET: 403
	BILLING_TRANS: gc.constants.APP_URI + "/settings/billingtrans/", // use GET: returns json and html cdata. json data is a bunch of settings, html is a link to a "Port Out" purchase
	CANCEL_ORDER: gc.constants.APP_URI + "/billing/cancelOrder/", // POST: {"ok":false,"error":"APPLICATION_ERROR;grand_central/GcNewBilling.CancelOrder;Order undefined not found for user 449551689692\n","errorCode":31}
	CANCEL_PORT: gc.constants.APP_URI + "/porting/cancelPortIn/", // POST: empty, GET: 403
	CANCEL_UPGRADE_CLIENT: gc.constants.APP_URI + "/settings/cancelUpgradeClient", // POST: {"ok":true} // no idea what it does
	CHECK_CARRIER: gc.constants.APP_URI + "/settings/checkCarrier/", // POST: empty response
	CHECK_CREDIT_ORDER: gc.constants.APP_URI + "/settings/checkCreditOrder/", // POST: {"ok":true,"data":{"status":0,"balance":""}}
	CHECK_FOR_SHARING: gc.constants.APP_URI + "/settings/checkIllegalSharing", // POST: empty response
	CHECK_FORWARDING_VERIFIED: gc.constants.APP_URI + "/settings/checkForwardingVerified", // GET: {"ok":false,"verified":false}
	CHECK_FORWARDING_VERIFIED_NO_ACCOUNT: gc.constants.APP_URI + "/settings/checkVerifiedNoAccount", // GET: {"ok":true,"verified":false}, POST: 403
	CHECK_MOBILE_SETUP_OPTIONS: gc.constants.APP_URI + "/setup/checkMobileSetupOptions", // Error 403 no matter how i try to access
	CHECK_NUMBER_FOR_PORTING: gc.constants.APP_URI + "/porting/checkNumber", // POST: {"ok":false,"data":{"carrier":"null","formattedPhoneNumber":"","transientError":false,"noFootprint":true,"unsupportedCarrier":true,"requirePin":false,"requireSsn":false}}
	CHECK_SPAM_FILTER_ENABLED: gc.constants.APP_URI + "/settings/checkSpamFilterEnabled", // POST: {"ok":true,"isSpamFilterEnabled":false}
	CONTACT_DETAILS: gc.constants.APP_URI + "/call/contactdetails/", POST: 403, GET: 500
	DELETE_FORWARDING: gc.constants.APP_URI + "/settings/deleteForwarding/", // POST: empty response
	DIVERSION_CODE: gc.constants.APP_URI + "/settings/getDiversionCode", // POST: 403, GET: 500
	DIVERSION_CODE_COMPLETE: gc.constants.APP_URI + "/settings/diversionCodeComplete", // POST: 500, GET: 403
	EDIT_BILLING_SETTINGS: gc.constants.APP_URI + "/billing/editSettings/", POST: {"ok":true}
	EDIT_BUSINESS: gc.constants.APP_URI + "/settings/editOrg/", // POST: 403, GET: 404
	EDIT_CONTACT: gc.constants.APP_URI + "/contacts/editContact/", // POST: {"ok":true,"result":{"ok":false,"error":"A system error has occurred"}}
	EDIT_FORWARDING: gc.constants.APP_URI + "/settings/editForwarding/", // POST: 403, GET: 404
	EDIT_FORWARDING_SMS: gc.constants.APP_URI + "/settings/editForwardingSms/", // POST: 403, GET: 404
	EDIT_GREETINGS: gc.constants.APP_URI + "/settings/editGreetings/", // POST or GET: {"ok":true}
	EDIT_GROUP: gc.constants.APP_URI + "/settings/editGroup/", // POST: 403, GET: 404
	EDIT_SETTINGS: gc.constants.APP_URI + "/settings/editGeneralSettings/", // {"ok":true,"data":{"defaultGreetingId":0,"directConnect":false,"voicemailFeature1":false}}
	EDIT_TRANSCRIPT_STATUS: gc.constants.APP_URI + "/settings/editTranscriptStatus/", // {"ok": true}
	EDIT_VOICEMAIL_SMS: gc.constants.APP_URI + "/settings/editVoicemailSms/", // Error 500
	FORCE_FORWARDING_VERIFIED: gc.constants.APP_URI + "/settings/setInVerification", // Error 500
	GENERATE_EMBED_CODE: gc.constants.APP_URI + "/embed/generateEmbedTag", // Error 500
	GET_CONTACT: gc.constants.APP_URI + "/contacts/getContactData/",
	GET_CONTACTS: gc.constants.APP_URI + "/phonebook/getall/",
	GET_NORMALIZED_NUMBER: gc.constants.APP_URI + "/setup/getNormalizedNumber/", // Error 500
	HELP_TEXT: gc.constants.APP_URI + "/help/helpText/", // Error 403
	NEW_NUMBER_SEARCH: gc.constants.APP_URI + "/setup/searchnew/", // { "JSON": { "num_matches":"500","translated_query":"","vanity_info":{... obj with phone numbers} }, "HTML": "html page to choose a number"}
	NEW_NUMBER_VANITY_SEARCH: gc.constants.APP_URI + "/setup/vanitysearchnew/",
	PORTING: gc.constants.APP_URI + "/porting", // a page with all sorts of stuff about porting numbers
	PORT_IN: gc.constants.APP_URI + "/porting/portIn", POST: 500, GET: 403
	PORT_OUT_CHECKOUT: gc.constants.APP_URI + "/porting/portOutCheckout",
	PORT_SUPPLEMENT: gc.constants.APP_URI + "/porting/update",
	PURCHASE_NUMBER_CHANGE: gc.constants.APP_URI + "/settings/purchasenumberchange",
	PURCHASE_VANITY_NUMBER: gc.constants.APP_URI + "/setup/purchasevanitynumber", // POST: {"ok":false,"error":{"message":"Cannot find function purchaseVanityPhoneNumber in object com.google.grandcentral.clients.billing.BillingClient@51279f9f."...}
	QUICK_ADD: gc.constants.APP_URI + "/phonebook/quickAdd/", // POST: empty, GET: Error 403
	RATE_CALL: gc.constants.APP_URI + "/inbox/ratecall/",
	RATE_TRANSCRIPT: gc.constants.APP_URI + "/inbox/rateTranscript/",
	RECORD_GREETING: gc.constants.APP_URI + "/call/recordGreeting/",
	RECORD_NAME: gc.constants.APP_URI + "/call/recordName/",
	RESERVE_DID: gc.constants.APP_URI + "/setup/reserve",
	SET_DO_NOT_DISTURB: gc.constants.APP_URI + "/settings/setDoNotDisturb/", // POST: {"ok":true} //
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
	VERIFY_FORWARDING: gc.constants.APP_URI + "/call/verifyForwarding" //  {"ok" : false, "error" : "Cannot complete call."}
*/

// what is https://www.google.com/voice/b/1/service/post ??  client posts something?? to it when you change settings in Settings->Calls and receives back [,[1,1,0,0,1,,1,0,0,"0",,"(user)@(email.com)"]]

/* Settings tabs are as follows: -- use "v" number that is apparently stored in gcData? as a GET param

 Return XML with JSON and HTML CDATA sections.

Phones: /settings/tab/phones -- json looks same as getPhoneInfo
Voicemail: /settings/tab/voicemailsettings -- json looks same as getPhoneInfo
   when click save, posts to /settings/editGeneralSettings {
       _rnr_se: ...
       emailNotificationActive: 1 (or 0?)
       emailNotificationAddress: user@email.com
       greeingId: 0
       missedToEmail: 0
       showTranscripts: 0 // toggled by the "Transcribe Voicemails" checkbox
       smsNotifications[+12025551212]: 0
       smsNotifications[+12025551213]: 0  // account had 2 phones defined
       smsToEmailActive: 1
       smsToEmailSubject: 0
       voicemailFeature1: 1
   }

Call Settings: /settings/tab/callsettings -- json looks same as getPhoneInfo

 options here all post to /service/post -- we can examine the functions in the Settings pages to see what the params and returns from this are, they are cryptic.

Groups And Circles: /settings/tab/groups -- json looks same as getPhoneInfo

Billing: /settings/tab/billing -- json looks same as getBillingCredit

Account: /settings/tab/settings -- json looks same as getPhoneInfo

 posts to /settings/editGeneralSettings, language/timezone: {
     _rnr_se: ...
     language: "en"
     timezone: "America/New_York" // (for "Eastern Time")
 }

 */