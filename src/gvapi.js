// This file only remains for reference, in case anything in the new version is completely broken.
/* eslint "global-require": 0 */

import { xmlGetRequest, xmlPostRequest } from './xhrMethods';

const getRequest = xmlGetRequest || require('./xhrMethods').xmlGetRequest;
const postRequest = xmlPostRequest || require('./xhrMethods').xmlPostRequest;

const galxUri = 'https://accounts.google.com/ServiceLoginAuth';
const galxParams = {
    service: 'grandcentral',
    continue: 'https://www.google.com/voice',
    followup: 'https://www.google.com/voice/',
    ltmpl: 'open',
};

// Get the GALX and gxf token from the ServiceLoginAuth page
// TODO: In SynerGV 1, we did not have the responseType: document, and so we had to
// manually parse the tokens out of the HTML.  There's possibility of browsers that don't
// support that still being in use, so perhaps there should be a fallback to that method.

// TODO: node.js doesn't have a built in document parser.. so might be worth getting that up
// and running sometime.

// TODO: Should probably consider grabbing the form id "gaia_loginform" and scraping
// all the info from it, as it might be useful to some calls.
// As is, I can't remember why we get the "gxf" token, other than it looks important for
// some reason or other. Might be necessary to get through the signin at gvLogin()

const getGALX = (callback) => {
    getRequest(galxUri, { params: galxParams, options: { responseType: 'document' } }, (doc) => {
        const tokens = {
            GALX: null,
            gxf: null,
        };
        // console.warn('*** doc=', doc);
        const galxElements = doc.getElementsByName('GALX');
        // console.warn('**** GALXelements[0]=', galxElements[0]);
        // tokens.GALX = galxElements[0].defaultValue;

        // TODO: The errors begin at this line, if you provide an incorrect password.
        // TODO: IMPORTANT!!! If test browser is completely logged out of Google in all tabs, all
        // logins are failing at this line!!! wat?!
        tokens.GALX = galxElements[0].getAttribute('value');

        const gxfElements = doc.getElementsByName('gxf');
        // tokens.gxf = gxfElements[0].defaultValue;
        tokens.gxf = gxfElements[0].getAttribute('value');

        callback(tokens);
    });
};

const mobileLoginParams = {
    Page: 'Reauth',
    GALX: '// Need a GALX token!',
    gxf: '// need a gxf token?',
    continue: 'https://www.google.com/voice',
    followup: 'https://www.google.com/voice',
    service: 'grandcentral',
    ltmpl: 'open',
    _utf8: '&#9731;',
    bgresponse: 'js_disabled',
    pstMsg: '0',
    dnConn: '',
    checkConnection: '',
    checkedDomains: 'youtube',
};

// this is a bit gross, but what it does, is it finds the last script in the file, which is a script
// that contains a javascript code to create an object called gcData which holds almost all of the info
// we could ever want to do whatever requests we need, and display a ton of stuff.
// This parses that script down to just the one javascript object creation string,
// then evals it to correctly parse it.  SynerGV 1 used a rather complex and easily breakable
// method that did not use eval.  We really do need to trust eval in this case, otherwise
// google adding comments to the middle of the JSON breaks things. Trailing commas break things.
// Single quotes break things. Improperly escaped quotes break things. No quotes breaks things.
// So on, so forth.

// 10/29/16: TESTED, WORKS.
// TODO: need to deal with a whole lot of possible error conditions i'm sure.
// eslint-ignore-next-line
const getXpcTokenAddress = 'https://clients4.google.com/voice/xpc/?xpc=%7B%22cn%22%3A%225TA7lWvzJx%22%2C%22tp%22%3Anull%2C%22pru%22%3A%22https%3A%2F%2Fwww.google.com%2Fvoice%2Fxpc%2Frelay%22%2C%22ppu%22%3A%22https%3A%2F%2Fwww.google.com%2Fvoice%2Fxpc%2Fblank%2F%22%2C%22lpu%22%3A%22https%3A%2F%2Fclients4.google.com%2Fvoice%2Fxpc%2Fblank%2F%22%7D';

const gvLogin = ({ username, password, tokens }, callback) => {
    const loginParams = {
        Email: username,
        Passwd: password,
        ...mobileLoginParams,
        ...tokens,
    };
    // TODO: throw an error if username, password, tokens.GALX or tokens.gxf are missing
    postRequest('https://accounts.google.com/signin/challenge/sl/password',
        {
            params: loginParams,
            options: { responseType: 'document', tokens },
        },
        (doc) => {
            // console.warn('*** expecting doc with gcData', doc);
            const x = doc.getElementsByTagName('script');
            const html = x[x.length - 1].innerText.trim();
            const i = html.indexOf('var _gcData = {');
            const j = html.indexOf('};', i) + 2;
            const tmp = html.substring(i, j);
            let gcData = '';
            try {
                // eslint-disable-next-line
                gcData = eval(`(function() {${tmp}; return _gcData; })();`);
            } catch (err) {
                console.error('**** ERROR EVALING GCDATA!', err);
                console.error('**** attempted eval: ', tmp);
                console.error('**** document is', doc);
                callback({ tokens: null, gcData: null, err: -1 });
                return;
            }
            const newTokens = {
                ...tokens,
                rnr: gcData._rnr_se,
            };

            getRequest(getXpcTokenAddress,
                { options: { tokens } },
                (xpcdoc /* , xhr */) => {
                    console.warn('**** xpc token document', xpcdoc);
                    const k = xpcdoc.indexOf('new _cd(\'') + 9;
                    const l = xpcdoc.indexOf('\'', k + 1);
                    const rToken = xpcdoc.substring(k, l);
                    console.warn('**** xpc token=', rToken);
                    newTokens.r = rToken;
                    // can't use params here because the initialauth param has no value.. hmm.
                    // TODO: should probably add 'null' support to the xhrMethods to allow
                    // adding get params with no values.
                    getRequest('https://www.google.com/voice/m?initialauth&pli=1',
                        {},
                        (/* gvxDoc, xhr */) => {
                            // presumably, we are actually logged in here. this may set some
                            // browser cookies.  We'd really like to have a cookie called "gvx",
                            // but it seems rather difficult to get it from a browser context, if
                            // you're javascript code.  That may just be when running in straight
                            // chrome, though, it seems that when using an app platform, we probably
                            // have access to the cookies set. At least on some. ???
                            callback({ tokens: newTokens, gcData });
                        }
                    );
                }
            );
        });
};

const getMessagesFromSMSRow = (row) => {
    const ret = {
        sentBy: row.getElementsByClassName('gc-message-sms-from')[0].textContent.trim(),
        sentTime: row.getElementsByClassName('gc-message-sms-time')[0].textContent.trim(),
        sentMessage: row.getElementsByClassName('gc-message-sms-text')[0].textContent.trim(),
    };
    return ret;
};

// sometimes the source data has a "CDATA" element that contains a big useful JSON string.
// This function will separate it out, and return it as a real javascript object.
// Update 31Oct16: add ability to parse messages out of HTML block

// returns: object with jsonData and messages. messages are parsed from the same html page
// passed in.

// TODO: This function could probably use some cleanup. It's based on synergv 1, which
// i was rank amateur for.

// TODO: should probably also merge all the data together, since that's what any user is going
// to probably do anyway, but for right now, i'm just going to leave it separate until I figure
// out how I want it merged for my uses.

const getJSONfromResponseCDATA = (x) => {
    // console.warn('*** getJSONfrom', x);
    let elementList = x.getElementsByTagName('json');
    // we probably only want the first one, there's probably only ever one. we hope.
    let text = elementList[0].innerHTML;
    let i = text.indexOf('{');
    let j = text.indexOf(']]>');
    const jsonData = JSON.parse(text.substring(i, j)); // TODO: should probably have a try
    let htmlData = '';
    let outMsgs = [];
    // console.warn("*** parsing", tmp);

    elementList = x.getElementsByTagName('html');
    if (elementList.length) {
        text = elementList[0].innerHTML;
        i = text.indexOf('<div id=');
        j = text.indexOf('<div class="gc-footer">');
        htmlData = text.substring(i, j);
        // console.warn('**** htmlData=', htmlData);

        const parser = new DOMParser();
        htmlData = parser.parseFromString(htmlData, 'text/html');
        console.warn('**** parsed htmlData=', htmlData);

        if (jsonData.messages) {
            const msgList = Object.keys(jsonData.messages);
            // console.warn(`**** parsing message data for ${msgList}`);

            outMsgs = msgList.map((m) => {
                const msgHtml = htmlData.getElementById(m);
                // console.warn('**** msg', m, msgHtml);
                const smsMsgBlocks = msgHtml.getElementsByClassName('gc-message-sms-row');
                // Note: getElementsByClassName returns an "array-like" item not an actual array. huh.
                const parsedMsgs = Array.prototype.map.call(smsMsgBlocks, getMessagesFromSMSRow);
                const locationElement = msgHtml.getElementsByClassName('gc-message-location')[0];
                const location = (locationElement && locationElement.textContent.trim()) || null;
                // TODO: for some reason can't directly access src from here, though there doesn't
                // appear to be any other elements involved. why?
                const portrait = msgHtml.getElementsByTagName('img')[0];
                const hasVmMessage = msgHtml.getElementsByClassName('gc-message-play');
                let vmMessageLength = 'unknown';
                if (hasVmMessage) {
                    const lengthBlock = hasVmMessage[0] && hasVmMessage[0].getElementsByClassName('goog-inline-block');
                    if (lengthBlock) {
                        vmMessageLength = lengthBlock[0].innerHTML;
                    }
                }
                return { [m]: { messages: parsedMsgs, location, vmMessageLength, portrait } };
            });
        }
    }
    return { jsonData, messages: outMsgs };
};

const baseurl = 'https://www.google.com/voice';
const clientsurl = 'https://clients4.google.com/voice'; // is this actually same as above?

// /////////////////////////////////////////////////////////////////////////////////////////////////
// export everything from here down
// /////////////////////////////////////////////////////////////////////////////////////////////////

// TESTED 10/29/16
// TODO: This is definitely going to need some error handling!!!!
const login = (username, password, callback) => {
    getGALX(galxTokens => gvLogin({
        username,
        password,
        tokens: galxTokens,
    }, callback));
};

// TESTED 10/29/16
// TODO: Needs to handle errors? how does this error? can it error?
// { ok: true, credit: 900, decoratedDefaultAmount: "$10.00", defaultAmount: "10", formattedCredit: "$0.09", minutes: 2000, paidCredit: "0", sms: 2000,
//   validAmounts: [ 10, 25, 50 ], decoratedValidAmounts{ { 0:"$10.00", 1:"$25.00", 2:"$50.00" }}

const getBillingCredit = (tokens, callback) => {
    postRequest(`${baseurl}/settings/billingcredit/`, { options: { tokens, responseType: 'json' } }, callback);
};

// TESTED 10/29/16
// { ok: true, data: { enabled: false } }

const getDoNotDisturb = (tokens, callback) => {
    getRequest(`${baseurl}/settings/getDoNotDisturb/`, { options: { tokens, responseType: 'json' } }, callback);
};

// TESTED 10/29/16
// TODO: anything else in /xpc/ ?
// TODO: There are at least: clients4.google.com/voice/xpc/checkMessages, /voice/xpc/checkContacts, /voice/xpc/getContacts
// TODO: unrelated to this function, but MrGecko had code for the newer? contacts interface, it looks like: https://github.com/GRMrGecko/VoiceMac/blob/610dc8126f10b676fda4d573fb1983f9f17c248e/Classes/VoiceBase/AddressBook/MGMGoogleContacts.m

// TESTED 11/02/16
// WORKING!
// {"ok":true,"data":{"unreadCounts":{"all":3,"inbox":3,"missed":1,"placed":0,"received":0,"recorded":0,"sms":1,"spam":0,"starred":0,"trash":0,"unread":3,"voicemail":1}}}

const checkMessages = (tokens, callback) => {
    getRequest(`${clientsurl}/xpc/checkMessages?r=${encodeURIComponent(tokens.r)}`, { params: { r: tokens.r }, options: { tokens, responseType: 'json' } }, callback);
};

// TODO: Investigate why getRequest params block isn't ending up in the URI as a get parameter. wat?
// TESTED 11/2/16, working, returns a number that appears to be a timestamp. Perhaps the last time
// contacts were updated? Do an occasional checkContacts, then when the number changes, do a
// getContacts?  Not real sure. Mine returns time very close to right now, but I've only currently
// tested it in conjunction with getContacts ...

const checkContacts = (tokens, callback) => {
    getRequest(`${clientsurl}/xpc/checkContacts?r=${encodeURIComponent(tokens.r)}`, { params: { r: tokens.r }, options: { tokens, responseType: 'json' } }, callback);
};

// TESTED 11/2/16, working, returns:
// { ok: true, data: { contactPhones: { huge object }, contacts: { huge object }, hasContactCustomForwarding: false, hasGroupCustomForwarding: false }}

const getContacts = (tokens, callback) => {
    getRequest(`${clientsurl}/xpc/getContacts?r=${encodeURIComponent(tokens.r)}`, { params: { r: tokens.r }, options: { tokens, responseType: 'json' } }, callback);
};

// TESTED 10/29/16
// { messages: { id1: { ... }, id2: { ... }, ... id10: { ... }, resultsPerPage: 10, totalSize: 416,
// unreadCounts: { all: 2, inbox: 2, missed: 1, placed: 0, received: 0, recorded: 0, sms: 0, spam: 0,
// starred: 0, trash: 0, unread: 2, voicemail: 1 } }
//
// message objects look like:
// { children: "", displayNumber: "(555) 555-1212", displayStartDateTime: "10/22/16 7:15 PM",
//   displayStartTime: "7:15 PM", duration: 0, hasMp3: true, hasOgg: true, id: "message-id-string",
//   isRead: true, isSpam: false, isTrash: false, messageText: "text of message", note: "",
//   phoneNumber: "+15555551212", relativeStartTime: "6 days ago", star: false,
//   startTime: "1477178107517", type: 10, labels: [ "all", "sms", "inbox" ] }
//
// ***why does a text message only conversation have hasMp3 and hasOgg true?!***

// TODO: Uh-oh.  Now that I've tested this call, I realize it only gives us the "front page"
// information -- there's just the first message that started a conversation, in messageText.
// There's no additional messages beyond the first.  Why? Where are they?  Are they being lost
// somewhere in the call? Crap.  This means I need to either find a different call to get the
// rest of the data about the messages, not just the metadata, OR we need to scrape the <html>
// tag that is sent in the same document that comes back from /inbox/recent/${label} .

// TODO: Of course, we do get some extra information if we scrape, that I'm pretty sure is not
// available from any other API calls, such as location (for numbers that are unknown, and have
// caller ID location available..) and user image..
// SO, the big TODO here is to comb through the Response in the browser Network tab for an
// entire page, and figure out what's useful there, and how to get it.
// ALSO, SynerGV 1 originally used this method, but I thought had moved to a different API to
// get the entire conversation text.  I might be completely wrong.

// TODO: Should probably parse 'messages' into a sane format (ie, an array) HERE instead of
// expecting the consumer to do it.  Also should pass back unreadCounts as a separate bit.
// resultsPerPage seems a useless parameter, as no one seems to know how to request any more or
// any fewer resultsPerPage.  totalSize might be interesting, but could be calculated quickly.
const getBox = ({ label = 'inbox', p = 1 } = {}, tokens, callback) => {
    getRequest(`${baseurl}/inbox/recent/${label}/?page=p${p || 1}`,
        {
            options: { responseType: 'document' },
        },
        (resp) => {
            callback(getJSONfromResponseCDATA(resp));
        });
};

// return a bunch of data about the phone configuration
// see bottom of file for sample response, it's pretty large.
// NOT TESTED 02Dec2016

const getPhoneInfo = (tokens, callback) => {
    getRequest(`${baseurl}/b/0/settings/tab/phones`,
                { options: { responseType: 'document' } },
                (resp) => {
                    callback(getJSONfromResponseCDATA(resp));
                });
};

// Original send: POST, Form Data:
// id: (conversationId)
// phoneNumber: +15551212
// conversationId: (conversationId)
// text: (message text)
// _rnr_se

// if you give it a valid conversationId, it will return a response that looks like:
// { ok: true, JSON: { ... a block containing the entire updated conversation! }, HTML: "a ton of junk i don't want to parse" }
// if you DON'T give it a conversationId, it will return:
// { ok: true, data: { code: 0 } }
// If given an invalid number (cannot possibly be used): (official client says "Invalid Number" when receiving)
// { ok: false, data: { code: 20 } }

// TESTED 02Dec2016 - works!

const sendMessage = (tokens, { recp, text, conversationId }, callback) => {
    const params = { phoneNumber: recp, text, id: conversationId || '', conversationId: conversationId || '' };
    postRequest(`${baseurl}/sms/send/`, { options: { tokens, responseType: 'json' }, params }, callback);
};

export {
    login,
    getBillingCredit, getDoNotDisturb, checkMessages, getBox, checkContacts, getContacts,
    getPhoneInfo,
    sendMessage,
};

// ok, before i continue porting all this stuff to the newer api structure, need to actually start
// doing some testing.

/*
    sendMessage(phoneNumber, text, callback) {
        const params = {
            phoneNumber,
            text,
            id: '',
        };
        getDocumentFromPost(`${baseurl}/sms/send/`, params, (resp) => { callback(resp); });
    }
    searchMessages(str, p, callback) {
        getDocumentFromGet(`${baseurl}/inbox/search?q=${str}&page=p${p || 1}`, {}, resp => callback(resp));
    }
    callNumber(outgoingNumber, forwardingNumber, phoneType, callback) {
        const params = {
            outgoingNumber,
            forwardingNumber,
            phoneType,
        };
        getDocumentFromPost(`${baseurl}/call/connect/`, params, resp => callback(resp));
        // { outgoingNumber: "2125551212", forwardingNumber: (phoneNumber to forward to), subscriberNumber: "undefined",
        //   phoneType: (phone type int) }
    }
    callCancel(callback) {
        const params = { outgoingNumber: '', forwardingNumber: '', cancelType: 'C2C' };
        getDocumentFromPost(`${baseurl}/call/cancel/`, params, resp => callback(resp));
        // { outgoingNumber: "", forwardingNumber: "", cancelType: "C2C" }
        // (does this mean you can make multiple simultaneous calls?)
    }
    saveNote(id, note, callback) {
        const params = {
            id,
            note,
        };
        getDocumentFromPost(`${baseurl}/savenote/`, params, resp => callback(resp));
        // { id: messageId, note: "note text" }
    }
    deleteNote(id, callback) {
        const params = {
            id,
        };
        getDocumentFromPost(`${baseurl}/deletenote/`, params, resp => callback(resp));
    }
    saveTranscript(callId, trans, callback) {
        const params = {
            callId,
            trans,
        };
        getDocumentFromPost(`${baseurl}/saveTranscript/`, params, resp => callback(resp));
    }
    restoreTranscript(callId, callback) {
        const params = {
            callId,
        };
        getDocumentFromPost(`${baseurl}/restoreTranscript/`, params, resp => callback(resp));
    }
    forward(toAddress, subject, body, link, callback) {
        const params = {
            toAddress,
            subject,
            body,
            includeLink: link ? '1' : '0',
        };
        getDocumentFromPost(`${baseurl}/inbox/reply/`, params, resp => callback(resp));
    }
    markRead(messages, read, callback) {
        const params = {
            messages,
            read,
        };
        getDocumentFromPost(`${baseurl}/mark/`, params, resp => callback(resp));
        // POST https://www.google.com/voice/inbox/mark/
    }
    archiveMessages(messages, archive, callback) {
        const params = {
            messages,
            archive,
        };
        getJSONFromPost(`${baseurl}/inbox/archiveMessages/`, params, resp => callback(resp));
        // { messages: messageId, archive: 1 }
        // presumably may take multiple messages, and may also allow you to unArchive
    }
    deleteMessage(messages, trash, callback) {
        const params = {
            messages,
            trash, // not clear if trash: 0 will un-trash a message?
        };
        getDocumentFromPost(`${baseurl}/deleteMessages/`, params, resp => callback(resp));
        // { messages: messageId } // why is this plural if it only takes 1 id?
    }
    deleteForeverMessage(messages, trash = '1', callback) {
        const params = {
            messages,
            trash, // not clear if necessary for deleteForever .. but whatevs
        };
        getDocumentFromPost(`${baseurl}/deleteForeverMessages/`, params, resp => callback(resp));
    }
    starMessage(messages, star, callback) {
        const params = {
            messages,
            star,
        };
        getDocumentFromPost(`${baseurl}/start/`, params, resp => callback(resp));
    }
    vmDownload(messages, callback) {
        const params = {
            messages,
        };
        getDocumentFromGet(`${baseurl}/media/send_voicemail`, params, resp => callback(resp));
        // { messages: messageId }
        // presumably may take multiple?
    }
    genSettings(callback) {
        getDocumentFromPost(`${baseurl}/settings/editGeneralSettings/`, {}, resp => callback(resp));
    }
    gvAddToContacts(callback) {
        getDocumentFromPost(`${baseurl}/phonebook/quickAdd/`, {}, resp => callback(resp));
        // TODO: Does this even work anymore since the contacts overhaul?
    }
    editDefaultForwarding(callback) {
        getDocumentFromPost(`${baseurl}/settings/editDefaultForwarding`, {}, resp => callback(resp));
    }
    blockMessage(messages, blocked, callback) {
        const params = {
            messages,
            blocked,
        };
        getJSONFromPost(`${baseurl}/inbox/block/`, params, resp => callback(resp));
        // { ok: true }
        // { ok: false, error: "Cannot block the number ..." }
    }
    donate(messages, donate, callback) {
        const params = {
            messages,
            donate,
        };
        getDocumentFromPost(`${baseurl}/donate/`, params, resp => callback(resp));
    }
    getSettings(callback) {
        const params = {};
        getDocumentFromPost(`${baseurl}/settings/tab/settings`, params, resp => callback(resp));
    }
    getTranscriptTiming(id, callback) {
        const params = {
            id,
        };
        getDocumentFromPost(`${baseurl}/media/transcriptWords`, params, resp => callback(resp));
    }
}

export default Synergv;
*/

/* Potentially useful information from www.google.com/voice/m code, if we could figure out how to make use of it:

proto.voicefe.BillableAction.Id = {CHANGE_NUMBER:2, MAKE_NUMBER_PERMANENT:1};

proto.voicefe.BillingService.Method = {GET_BILLABLE_ACTION_COST:6, GET_CALLING_RATES:1, GET_DESTINATION_CALLING_RATES:7, GET_ORDER_STATUS:8, GET_SUPPORTED_CURRENCIES:2, GET_VAT_BILLING_COUNTRIES:9, PORT_OUT_NUMBER_NO_CHARGE:13, PURCHASE_CALLING_CREDIT:10, PURCHASE_NUMBER_CHANGE:14, PURCHASE_NUMBER_PORT_IN:11, PURCHASE_NUMBER_PORT_OUT:12, SET_CURRENCY:3, MAKE_NUMBER_PERMANENT:5};

proto.grand_central.CallProblemReport.Reason = {BAD_CALL_QUALITY_DELAY:0, BAD_CALL_QUALITY_ECHO:1, BAD_CALL_QUALITY_COULD_NOT_HEAR_OTHER_PARTY:2, BAD_CALL_QUALITY_OTHER_PARTY_COULD_NOT_HEAR_ME:3, CALL_NOT_CONNECTED:4, CALL_CHARGED_WRONG_RATE:5, REFUND_ADJUSTMENT:6, INITIAL_CREDIT:7, BAD_CALL_QUALITY_LOW_VOLUME:8, BAD_CALL_RANDOM_SOUNDS:9, BAD_CALL_QUALITY_CHOPPY:10, CALL_DISCONNECTED:11, BREAKAGE:12, BALANCE_TRANSFER:13, OTHER:99, NO_PROBLEM:100};

proto.grand_central.BillingTransaction.Type = {PAID:0, FREE:1, CALL:2, REFUND:3, PHONE_NUMBER_CHANGE:4, VANITY_NUMBER_PURCHASE:5, BREAKAGE:6, SMS:7, PORT_IN:8, PORT_OUT:9, EXTEND_NUMBER_EXPIRATION:10, UNKNOWN:17};
proto.grand_central.BillingTransaction.Product = {PRODUCT_CREDIT:0, PRODUCT_PHONE_NUMBER_CHANGE:1, PRODUCT_VANITY_NUMBER_PURCHASE:2, PRODUCT_PORT_IN:3, PRODUCT_PORT_OUT:4, PRODUCT_EXTEND_NUMBER_EXPIRATION:5};
proto.grand_central.BillingTransaction.NewType = {TYPE_PAID:0, TYPE_FREE:1, TYPE_CALL:2, TYPE_REFUND:3, TYPE_BREAKAGE:4, TYPE_SMS:5, TYPE_UNKNOWN:10};
proto.grand_central.BillingTransaction.Status = {CREATED:0, SUCCESSFUL:1, CANCELED:2, WAITING_FOR_CREDIT_CARD_UPDATE:3, WAITING_FOR_REVIEW:4, CHARGED_BUT_UNFULFILLED:5};

proto.voicefe.Service.Id = {ACCOUNT_TRANSFER_SERVICE:6, BILLING_SERVICE:1, CALL_SERVICE:5, NUMBER_TRANSFER_SERVICE:9, PARTNER_SERVICE:2, PORT_OUT_SERVICE:8, SETTINGS_SERVICE:3, SMS_SERVICE:7, VOICE_SERVICE:4};

gc.constants.APP_URI = appUri_;
gc.constants.APP_TITLE = "Google Voice";
gc.constants.COOKIE_LIFE = 7776E3;
gc.constants.TOKEN_SEPARATOR = "/";
gc.constants.SELECTOR_PARAM = "b";
gc.constants.ORG_SELECTOR_PARAM = "o";
gc.constants.TEMP_PHONE_TYPE = 99;
gc.constants.UNICODE_SPACE = "\u00a0";
gc.constants.AUDIO_API_ID = "gc-invisible-audio";
gc.constants.PARTNER_CELL_LIMIT = 1;
gc.constants.GENERIC_PHOTO_URL = "//generic_photo.png";
gc.constants.SPRINT_LANDING_PAGE_URL = "https://www.google.com/googlevoice/sprint";
gc.constants.SPRINT_PARTNER_NAME = "Sprint";
gc.constants.NO_PHONE_NUMBER = "CLIENT_ONLY";
gc.constants.GOOGLE_FEEDBACK_ID = "96264";
gc.constants.GOOGLE_FEEDBACK_BUCKET = {WEB:"web"};
gc.constants.ServiceId = {BILLING_CLIENT:"billing_client", CALL_CLIENT:"call_client", EXPERIMENTS_CLIENT:"experiments_client", NUMBER_TRANSFER_CLIENT:"number_transfer_client", PARTNER_CLIENT:"partner_client", PORT_OUT_CLIENT:"port_out_client", SETTINGS_CLIENT:"settings_client", SMS_CLIENT:"sms_client", VOICE_CLIENT:"voice_client"};
gc.constants.AccountType = {FREE:0, CARE:1, PREMIUM:2, MIGRATED:3, DEPRECATED_PLACEHOLDER:4, VOICE_LITE:5, DEPRECATED_PLACEHOLDER2:7, CLIENT_ONLY:8, ORGANIZATION:9, DEPRECATED_EMPLOYEE:10};
gc.constants.MediaUri = {VOICEMAIL:"/media/send_voicemail/", GREETING:"/media/send_greeting/", OUT_OF_SERVICE:"/media/sendOutOfServiceMessage", PHONEBOOK_NAME:"/media/sendPhonebookName/", SHARED_VOICEMAIL:"/media/svm/", SUBSCRIBER_NAME:"/media/sendRecordedName/", VOICEMAIL_OGG:"/media/send_voicemail_ogg/"};
gc.constants.InternalPhoneTypes = {SIP:"4", TALK:"9"};
gc.constants.FocusPhoneTypes = {MOBILE:"MOBILE", WORK:"WORK", HOME:"HOME"};
gc.constants.CallTypes = {VOICEMAIL:2, RECORDING:4, SMS_IN:10, SMS_OUT:11, MISSED:0};
gc.constants.Carrier = {ALLTEL:"ALLTEL", ATT:"ATT", CELL_SOUTH:"CELL_SOUTH", CRICKET:"CRICKET", METROPCS:"METROPCS", NTELOS_US:"NTELOS_US", SPRINT:"SPRINT", TMOBILE:"TMOBILE", USCELLULAR:"USCELLULAR", VERIZON:"VERIZON", TELOPS:"TELOPS"};
gc.constants.CarrierName = goog.object.create(gc.constants.Carrier.ALLTEL, "Alltel", gc.constants.Carrier.ATT, "AT&T", gc.constants.Carrier.CELL_SOUTH, "Cellular South", gc.constants.Carrier.CRICKET, "Cricket", gc.constants.Carrier.METROPCS, "Metro PCS", gc.constants.Carrier.NTELOS_US, "nTelos", gc.constants.Carrier.SPRINT, "Sprint", gc.constants.Carrier.TMOBILE, "T-Mobile", gc.constants.Carrier.USCELLULAR, "US Cellular", gc.constants.Carrier.VERIZON, "Verizon", gc.constants.Carrier.TELOPS, "TELOPS");
gc.constants.Partner = {NONE:0, SPRINT:1, TELOPS:2};
gc.constants.CancelCallTypes = {CLICK_TO_CALL:"C2C", RECORDING:"RECORDING", VERIFY_FORWARDING:"VERIFY_FORWARDING"};
gc.constants.NumberChangeTypes = {CHANGE_NUMBER:0, VANITY_NUMBER:1, ADDITIONAL_NUMBER:2};
gc.constants.ViewId = {ALL_MESSAGES:"all", BILLING:"billing", BUSINESS:"business", CALL:"call", CALL_SETTINGS:"callsettings", CONTACTS:"contacts", CUSTOM_SETTINGS:"customsettings", EDIT_GROUP:"editgroup", EDIT_PHONE:"editphone", FEEDBACK:"feedback", GROUPS:"groups", HISTORY:"history", INBOX:"inbox", MESSAGE:"message", MIGRATE_COMPLETE:"migrateComplete", MISSED:"missed", PHONES:"phones", PLACED:"placed", RECEIVED:"received", RECORDED:"recorded", SEARCH:"search", SETTINGS:"settings", SETUP:"setup",
SETUP_RESERVED:"setupReserved", SETUP_VM:"setupvm", SMS:"sms", SPAM:"spam", STANDALONE_CONTACTS:"standaloneContacts", STARRED:"starred", TRASH:"trash", UNREAD:"unread", UPGRADE:"upgrade", VIEW_CONTACT:"viewcontact", VOICEMAIL:"voicemail", VOICEMAIL_SETTINGS:"voicemailsettings"};
gc.constants.ValidationExp = {EMAIL_ADDRESS:/^([a-zA-Z0-9\.\_\-\+])+@([a-zA-Z0-9.-]+\.)+[a-zA-Z0-9.-]{2,63}$/, PIN_NUMBER:/^[1-9]\d{3,9}$/, SETUP_SEARCH_PHRASE:/^[a-zA-Z0-9 ]+$/, SETUP_LOCATION_SEARCH:/^(\d{3}|\d{5}|[a-zA-Z ]+)$/, SETUP_LOCATION_SEARCH_CANADA:/^(\d{3}|[a-zA-Z]\d[a-zA-Z]|[a-zA-Z ]+)$/, ONE_OR_MORE_ALPHANUM:/[a-zA-Z0-9]+/, NO_LETTERS:/^[^a-zA-Z]+$/};
gc.constants.KeyboardShortcuts = {ENTER:"ENTER"};
gc.constants.HelpCenter = {GENERAL:"https://www.google.com/support/voice/"};
gc.constants.PhoneType = {CELL:"2", GIZMO:"7", GOOGLE_TALK:"9", HOME:"1", PARTNER_CELL:"10", SIP:"4", WORK:"3"};
gc.constants.PhoneBrand = {NONE:0, FIBER:1};
gc.constants.SignupSource = {GIZMO:1, GOOGLE_TALK:2, PARTNER:3, PORTING:4, VOICE_WEB_UI:5};
gc.constants.SignupStatus = {COMPLETE:0, PIN_NEEDED:1, ACTIVATION_NEEDED:2, UPGRADE_FROM_CLIENT:3, PARTNER_ACTIVATION_NEEDED:4};
gc.constants.PhoneTypeName = goog.object.create(gc.constants.PhoneType.CELL, gc.msgs.MSG_MOBILE_TYPE, gc.constants.PhoneType.GIZMO, "Gizmo", gc.constants.PhoneType.GOOGLE_TALK, "Google Chat", gc.constants.PhoneType.HOME, gc.msgs.MSG_HOME_TYPE, gc.constants.PhoneType.PARTNER_CELL, gc.msgs.MSG_MOBILE_TYPE, gc.constants.PhoneType.SIP, "VOIP Phone", gc.constants.PhoneType.WORK, gc.msgs.MSG_WORK_TYPE);
gc.constants.PhoneTypeMenu = [gc.constants.PhoneType.CELL, gc.constants.PhoneType.WORK, gc.constants.PhoneType.HOME];
gc.constants.Cookie = {NEW_SIGNUP:"gc_new_user"};
gc.constants.DialogClass = {WORKING:"gc-setup-working-msg", ERROR:"gc-setup-error-msg"};
gc.constants.ReclaimCheckResult = {POSSIBLE:1, TOO_MANY_RECLAIMS:2, NOT_POSSIBLE:3};
gc.constants.PromoId = {IPRINT:1, GIZMO_SIP:2, GOOGLE_TALK:3, SPRINT_PHONE_PROVISION:4, SPRINT_ACCOUNT_PROVISION:5, GLOBAL_SPAM_FILTER:6, DIRECT_RTP:7, REVERIFY_PHONE:8, CM2:9, SANTA:10, SVM_PRELAUNCH:11, SVM_LAUNCH:12, SMS_HANGOUTS_OPTIN:13, SMS_HANGOUTS_OPTOUT:14, DONATE_VOICEMAILS:15, INSTALL_HANGOUTS_DIALER:16};
gc.constants.ActionUri = {APPEAL_SMS:gc.constants.APP_URI + "/sms/appeal", ARCHIVE_MESSAGES:gc.constants.APP_URI + "/inbox/archiveMessages/", BILLING_CREDIT:gc.constants.APP_URI + "/settings/billingcredit/", BILLING_TRANS:gc.constants.APP_URI + "/settings/billingtrans/", BLOCK_MESSAGES:gc.constants.APP_URI + "/inbox/block/", CALL:gc.constants.APP_URI + "/call/connect/", CANCEL:gc.constants.APP_URI + "/call/cancel/", CANCEL_ORDER:gc.constants.APP_URI + "/billing/cancelOrder/", CANCEL_PORT:gc.constants.APP_URI +
"/porting/cancelPortIn/", CANCEL_UPGRADE_CLIENT:gc.constants.APP_URI + "/settings/cancelUpgradeClient", CHECK_CARRIER:gc.constants.APP_URI + "/settings/checkCarrier/", CHECK_CREDIT_ORDER:gc.constants.APP_URI + "/settings/checkCreditOrder/", CHECK_FOR_SHARING:gc.constants.APP_URI + "/settings/checkIllegalSharing", CHECK_FORWARDING_VERIFIED:gc.constants.APP_URI + "/settings/checkForwardingVerified", CHECK_FORWARDING_VERIFIED_NO_ACCOUNT:gc.constants.APP_URI + "/settings/checkVerifiedNoAccount", CHECK_MESSAGES:gc.constants.APP_URI +
"/inbox/checkMessages/", CHECK_MOBILE_SETUP_OPTIONS:gc.constants.APP_URI + "/setup/checkMobileSetupOptions", CHECK_NUMBER_FOR_PORTING:gc.constants.APP_URI + "/porting/checkNumber", CHECK_SPAM_FILTER_ENABLED:gc.constants.APP_URI + "/settings/checkSpamFilterEnabled", CONTACT_DETAILS:gc.constants.APP_URI + "/call/contactdetails/", DELETE_FOREVER_MESSAGES:gc.constants.APP_URI + "/inbox/deleteForeverMessages/", DELETE_FORWARDING:gc.constants.APP_URI + "/settings/deleteForwarding/", DELETE_MESSAGES:gc.constants.APP_URI +
"/inbox/deleteMessages/", DELETE_NOTE:gc.constants.APP_URI + "/inbox/deletenote/", DIVERSION_CODE:gc.constants.APP_URI + "/settings/getDiversionCode", DIVERSION_CODE_COMPLETE:gc.constants.APP_URI + "/settings/diversionCodeComplete", DONATE:gc.constants.APP_URI + "/inbox/donate/", EDIT_BILLING_SETTINGS:gc.constants.APP_URI + "/billing/editSettings/", EDIT_BUSINESS:gc.constants.APP_URI + "/settings/editOrg/", EDIT_CONTACT:gc.constants.APP_URI + "/contacts/editContact/", EDIT_DEFAULT_FORWARDING:gc.constants.APP_URI +
"/settings/editDefaultForwarding/", EDIT_FORWARDING:gc.constants.APP_URI + "/settings/editForwarding/", EDIT_FORWARDING_SMS:gc.constants.APP_URI + "/settings/editForwardingSms/", EDIT_GREETINGS:gc.constants.APP_URI + "/settings/editGreetings/", EDIT_GROUP:gc.constants.APP_URI + "/settings/editGroup/", EDIT_SETTINGS:gc.constants.APP_URI + "/settings/editGeneralSettings/", EDIT_TRANSCRIPT_STATUS:gc.constants.APP_URI + "/settings/editTranscriptStatus/", EDIT_VOICEMAIL_SMS:gc.constants.APP_URI + "/settings/editVoicemailSms/",
FORCE_FORWARDING_VERIFIED:gc.constants.APP_URI + "/settings/setInVerification", GENERATE_EMBED_CODE:gc.constants.APP_URI + "/embed/generateEmbedTag", GET_CONTACT:gc.constants.APP_URI + "/contacts/getContactData/", GET_CONTACTS:gc.constants.APP_URI + "/phonebook/getall/", GET_DO_NOT_DISTURB:gc.constants.APP_URI + "/settings/getDoNotDisturb/", GET_NORMALIZED_NUMBER:gc.constants.APP_URI + "/setup/getNormalizedNumber/", HELP_TEXT:gc.constants.APP_URI + "/help/helpText/", MARK_MESSAGES:gc.constants.APP_URI +
"/inbox/mark/", NEW_NUMBER_SEARCH:gc.constants.APP_URI + "/setup/searchnew/", NEW_NUMBER_VANITY_SEARCH:gc.constants.APP_URI + "/setup/vanitysearchnew/", PORTING:gc.constants.APP_URI + "/porting", PORT_IN:gc.constants.APP_URI + "/porting/portIn", PORT_OUT_CHECKOUT:gc.constants.APP_URI + "/porting/portOutCheckout", PORT_SUPPLEMENT:gc.constants.APP_URI + "/porting/update", PURCHASE_NUMBER_CHANGE:gc.constants.APP_URI + "/settings/purchasenumberchange", PURCHASE_VANITY_NUMBER:gc.constants.APP_URI + "/setup/purchasevanitynumber",
QUICK_ADD:gc.constants.APP_URI + "/phonebook/quickAdd/", RATE_CALL:gc.constants.APP_URI + "/inbox/ratecall/", RATE_TRANSCRIPT:gc.constants.APP_URI + "/inbox/rateTranscript/", RECORD_GREETING:gc.constants.APP_URI + "/call/recordGreeting/", RECORD_NAME:gc.constants.APP_URI + "/call/recordName/", RESERVE_DID:gc.constants.APP_URI + "/setup/reserve", RESTORE_TRANSCRIPT:gc.constants.APP_URI + "/inbox/restoreTranscript/", SAVE_NOTE:gc.constants.APP_URI + "/inbox/savenote/", SAVE_TRANS:gc.constants.APP_URI +
"/inbox/saveTranscript/", SEND_EMAIL:gc.constants.APP_URI + "/inbox/reply/", SEND_SMS:gc.constants.APP_URI + "/sms/send/", SET_DO_NOT_DISTURB:gc.constants.APP_URI + "/settings/setDoNotDisturb/", SET_FORWARDING_ENABLED:gc.constants.APP_URI + "/settings/setForwardingEnabled/", SETUP_CREATE:gc.constants.APP_URI + "/setup/create/", SETUP_CREATE_CLIENT:gc.constants.APP_URI + "/setup/createclientonly/", SETUP_CREATE_VM:gc.constants.APP_URI + "/setup/createvm/", SETUP_SEARCH:gc.constants.APP_URI + "/setup/search/",
SETUP_VANITY_SEARCH:gc.constants.APP_URI + "/setup/vanitysearch/", SPAM_MESSAGES:gc.constants.APP_URI + "/inbox/spam/", STAR:gc.constants.APP_URI + "/inbox/star/", UNDO_CHANGE_DID:gc.constants.APP_URI + "/setup/undonumberchange", UNRESERVE_DID:gc.constants.APP_URI + "/setup/unreserve", UPGRADE_CLIENT:gc.constants.APP_URI + "/settings/upgradeClient", UPGRADE_LITE:gc.constants.APP_URI + "/settings/upgrade", VERIFY_FORWARDING:gc.constants.APP_URI + "/call/verifyForwarding"};

gvoice.PHONE_TYPE = {UNKNOWN:0, HOME:1, CELL:2, WORK:3, GIZMO:7, GOOGLE_TALK:9, PARTNER_CELL:10, QUICK_ADD:99};

*/

// What in hell is this? https://www.google.com/voice/new/u/0/experiments
// responds [,1,,,,1,1,0,0,,,0,0]

// TODO: /voice/xpc/?xpc={"cn":"i70avDIMsA","tp":null,"pru":"https://www.google.com/voice/xpc/relay","ppu":"https://www.google.com/voice/xpc/blank/","lpu":"https://clients4.google.com/voice/xpc/blank/"}
// TODO: from https://github.com/GRMrGecko/VoiceMac/blob/610dc8126f10b676fda4d573fb1983f9f17c248e/Classes/VoiceBase/MGMInstance.m
// TODO: looks like the standard gv page runs this as an iframe:
/*
<iframe id="xpcpeerB2cc" name="xpcpeerB2cc" style="height: 100%; width: 100%;" src="https://clients4.google.com/voice/xpc/?xpc=%7B%22cn%22%3A%225TA7lWvzJx%22%2C%22tp%22%3Anull%2C%22pru%22%3A%22https%3A%2F%2Fwww.google.com%2Fvoice%2Fxpc%2Frelay%22%2C%22ppu%22%3A%22https%3A%2F%2Fwww.google.com%2Fvoice%2Fxpc%2Fblank%2F%22%2C%22lpu%22%3A%22https%3A%2F%2Fclients4.google.com%2Fvoice%2Fxpc%2Fblank%2F%22%7D">
<html>
*/

// Aha! the "r" comes in as:
// <body onload="new _cd(' r token is here!! ', null, null, 'https://www.google.com');"></body>
// it is the first param to _cd constructor.  it should be passed to the xpc calls as a get parameter

// getPhones response:
// {
// 	"phones": {
// 		"2": {
// 			"id": 2,
// 			"name": "(Name Specified For Phone)",
// 			"phoneNumber": "+15551212",
// 			"type": 2,
// 			"verified": false,
// 			"policyBitmask": 0,
// 			"lastUse": "1261171299000",
// 			"dEPRECATEDDisabled": false,
// 			"telephonyVerified": true,
// 			"disabledTimes": "{\"day_\":[{\"current_day_\":1,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":2,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":3,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":4,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":5,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":6,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":7,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1}],\"isMutable\":true,\"cachedSize\":-1}",
// 			"smsEnabled": false,
// 			"dateAdded": "1255840605022",
// 			"incomingAccessNumber": "",
// 			"voicemailForwardingVerified": false,
// 			"behaviorOnRedirect": 0,
// 			"carrier": "SPRINT",
// 			"customOverrideState": 0,
// 			"inVerification": false,
// 			"partner": "null",
// 			"lastVerificationDate": "0",
// 			"lastBackendInfoRequestDate": "0",
// 			"reverifyNeededDate": "0",
// 			"unverifyScheduledDate": "0",
// 			"stalenessInfo": "{\"latest_deactivation_signal_time_\":0,\"deprecated_latest_activity_freshness_update_time_\":0,\"deprecated_activity_freshness_value_\":0.0,\"first_indication_of_staleness_time_\":0,\"staleness_notification_\":[{\"notification_time_\":1424454667952,\"message_type_\":1,\"notification_number_\":1,\"planned_unverification_time_\":1427046667952,\"optional_0_\":15,\"isMutable\":true,\"cachedSize\":-1},{\"notification_time_\":1426549980748,\"message_type_\":1,\"notification_number_\":2,\"planned_unverification_time_\":1427413980748,\"optional_0_\":15,\"isMutable\":true,\"cachedSize\":-1},{\"notification_time_\":1427415495824,\"message_type_\":2,\"notification_number_\":3,\"planned_unverification_time_\":1427413980748,\"optional_0_\":15,\"isMutable\":true,\"cachedSize\":-1}],\"optional_0_\":0,\"isMutable\":true,\"cachedSize\":-1}",
// 			"provisionablePartner": 0,
// 			"recentlyProvisionedOrDeprovisioned": false,
// 			"forwardingCountry": "US",
// 			"visibility": 0,
// 			"sharingGroupId": 0,
// 			"brand": 0,
// 			"formattedNumber": "(555) 555-1212",
// 			"reverifyNeeded": false,
// 			"wd": {
// 				"allDay": false,
// 				"times": []
// 			},
// 			"we": {
// 				"allDay": false,
// 				"times": []
// 			},
// 			"scheduleSet": false,
// 			"weekdayAllDay": false,
// 			"weekdayTimes": [],
// 			"weekendAllDay": false,
// 			"weekendTimes": [],
// 			"redirectToVoicemail": false,
// 			"active": true,
// 			"displayUnverifyScheduledDateTime": "12/31/69",
// 			"enabledForOthers": true
// 		},
// 		"4": {
// 			"id": 4,
// 			"name": "Google Talk",
// 			"phoneNumber": "googleemailaddress@google.com",
// 			"type": 9,
// 			"verified": true,
// 			"policyBitmask": 0,
// 			"lastUse": "0",
// 			"dEPRECATEDDisabled": false,
// 			"telephonyVerified": false,
// 			"disabledTimes": "null",
// 			"smsEnabled": true,
// 			"dateAdded": "1282947046092",
// 			"incomingAccessNumber": "",
// 			"voicemailForwardingVerified": false,
// 			"behaviorOnRedirect": 0,
// 			"carrier": "",
// 			"customOverrideState": 0,
// 			"inVerification": false,
// 			"partner": "null",
// 			"lastVerificationDate": "0",
// 			"lastBackendInfoRequestDate": "0",
// 			"reverifyNeededDate": "0",
// 			"unverifyScheduledDate": "0",
// 			"stalenessInfo": "null",
// 			"provisionablePartner": 0,
// 			"recentlyProvisionedOrDeprovisioned": false,
// 			"forwardingCountry": "",
// 			"visibility": 0,
// 			"sharingGroupId": 0,
// 			"brand": 0,
// 			"formattedNumber": "blade.eric@gmail.com",
// 			"reverifyNeeded": false,
// 			"wd": {
// 				"allDay": false,
// 				"times": []
// 			},
// 			"we": {
// 				"allDay": false,
// 				"times": []
// 			},
// 			"scheduleSet": false,
// 			"weekdayAllDay": false,
// 			"weekdayTimes": [],
// 			"weekendAllDay": false,
// 			"weekendTimes": [],
// 			"redirectToVoicemail": false,
// 			"active": true,
// 			"displayUnverifyScheduledDateTime": "12/31/69",
// 			"enabledForOthers": true
// 		},
// 		"9": {
// 			"id": 9,
// 			"name": "Name of Cell Phone",
// 			"phoneNumber": "+15555551212",
// 			"type": 2,
// 			"verified": true,
// 			"policyBitmask": 1,
// 			"lastUse": "0",
// 			"dEPRECATEDDisabled": false,
// 			"telephonyVerified": true,
// 			"disabledTimes": "{\"day_\":[{\"current_day_\":1,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":2,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":3,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":4,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":5,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":6,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1},{\"current_day_\":7,\"all_day_\":false,\"optional_0_\":3,\"isMutable\":true,\"cachedSize\":-1}],\"isMutable\":true,\"cachedSize\":-1}",
// 			"smsEnabled": false,
// 			"dateAdded": "1427527917306",
// 			"incomingAccessNumber": "",
// 			"voicemailForwardingVerified": true,
// 			"behaviorOnRedirect": 1,
// 			"carrier": "ATT",
// 			"customOverrideState": 0,
// 			"inVerification": false,
// 			"partner": "null",
// 			"lastVerificationDate": "1427527944169",
// 			"lastBackendInfoRequestDate": "1432066700971",
// 			"reverifyNeededDate": "0",
// 			"unverifyScheduledDate": "0",
// 			"stalenessInfo": "{\"latest_deactivation_signal_time_\":0,\"deprecated_latest_activity_freshness_update_time_\":0,\"deprecated_activity_freshness_value_\":0.0,\"first_indication_of_staleness_time_\":0,\"activity_freshness_signal_info_\":{\"latest_activity_signal_update_time_\":0,\"outbound_call_activity_signal_\":[{\"activity_signal_header_\":{\"timestamp_\":1478717245000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1478825740000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1479004646000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1479071240000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1479434719000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1479579792000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1479610483000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1480109265000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1480178876000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1480185506000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1}],\"long_inbound_call_activity_signal_\":[{\"activity_signal_header_\":{\"timestamp_\":1472743525000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1472743810000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1474409137000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1475620970000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1476236117000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1477072469000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1477789616000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1478469769000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1478474096000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},{\"activity_signal_header_\":{\"timestamp_\":1479929571000,\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":1,\"isMutable\":true,\"cachedSize\":-1}],\"optional_0_\":0,\"isMutable\":true,\"cachedSize\":-1},\"optional_0_\":16,\"isMutable\":true,\"cachedSize\":-1}",
// 			"provisionablePartner": 0,
// 			"recentlyProvisionedOrDeprovisioned": false,
// 			"forwardingCountry": "US",
// 			"visibility": 0,
// 			"sharingGroupId": 0,
// 			"brand": 0,
// 			"formattedNumber": "(555) 555-1212",
// 			"reverifyNeeded": false,
// 			"wd": {
// 				"allDay": false,
// 				"times": []
// 			},
// 			"we": {
// 				"allDay": false,
// 				"times": []
// 			},
// 			"scheduleSet": false,
// 			"weekdayAllDay": false,
// 			"weekdayTimes": [],
// 			"weekendAllDay": false,
// 			"weekendTimes": [],
// 			"redirectToVoicemail": true,
// 			"active": true,
// 			"displayUnverifyScheduledDateTime": "12/31/69",
// 			"enabledForOthers": true
// 		},
// 	},
// 	"phoneList": [2, 4, 9],
// 	"settings": {
// 		"primaryDid": "+15555551212",
// 		"language": "en",
// 		"screenBehavior": 0,
// 		"useDidAsCallerId": false,
// 		"credits": 900,
// 		"timezone": "America/New_York",
// 		"doNotDisturb": false,
// 		"directRtp": 0,
// 		"filterGlobalSpam": 1,
// 		"enablePinAccess": 1,
// 		"pendingDid": "",
// 		"changeType": 0,
// 		"paymentStarted": false,
// 		"didInfos": [],
// 		"primaryDidInfo": { // primaryDid seems to be the Google Voice account number, not sure if this can be different or not
// 			"phoneNumber": "+15555551212",
// 			"formattedNumber": "(555) 555-1212",
// 			"expiration": "0",
// 			"releaseDidAllowed": true,
// 			"transferDidAllowed": true
// 		},
// 		"lastDeletedDid": "",
// 		"smsNotifications": [{
// 			"address": "+17342235060",
// 			"active": false
// 		}],
// 		"emailNotificationActive": false,
// 		"emailNotificationAddress": "googleemailaddress@google.com",
// 		"smsToEmailActive": true,
// 		"smsToEmailSubject": false,
// 		"missedToEmail": false,
// 		"showTranscripts": true,
// 		"directConnect": true,
// 		"useDidAsSource": true,
// 		"emailToSmsActive": false,
// 		"i18nSmsActive": false,
// 		"missedToInbox": true,
// 		"greetings": [{
// 			"id": "0",
// 			"name": "System Standard",
// 			"jobberName": ""
// 		}, {
// 			"id": 1,
// 			"name": "New Custom Greeting",
// 			"jobberName": "309299044928.vmgrt.mulaw"
// 		}],
// 		"greetingsMap": {
// 			"1": {
// 				"id": 1,
// 				"name": "New Custom Greeting",
// 				"jobberName": "309299044928.vmgrt.mulaw"
// 			}
// 		},
// 		"activeForwardingIds": [2, 4, 9],
// 		"disabledIdsForOthers": "null",
// 		"disabledIdMap": {
// 			"2": true,
// 			"5": true,
// 			"6": true,
// 			"3": true,
// 			"4": true
// 		},
// 		"defaultGreetingId": 1,
// 		"groups": {
// 			"15": {
// 				"id": "15",
// 				"name": "Coworkers",
// 				"disabledForwardingIds": {},
// 				"isCustomForwarding": false,
// 				"isCustomGreeting": false,
// 				"isCustomDirectConnect": false,
// 				"directConnect": false,
// 				"greetingId": 0,
// 				"isCircle": false,
// 				"isCustomTranscriptionLanguage": false,
// 				"transcriptionLanguage": ""
// 			},
// 			"13": {
// 				"id": "13",
// 				"name": "Friends",
// 				"disabledForwardingIds": {},
// 				"isCustomForwarding": false,
// 				"isCustomGreeting": false,
// 				"isCustomDirectConnect": false,
// 				"directConnect": false,
// 				"greetingId": 0,
// 				"isCircle": false,
// 				"isCustomTranscriptionLanguage": false,
// 				"transcriptionLanguage": ""
// 			},
// 			"14": {
// 				"id": "14",
// 				"name": "Family",
// 				"disabledForwardingIds": {},
// 				"isCustomForwarding": false,
// 				"isCustomGreeting": false,
// 				"isCustomDirectConnect": false,
// 				"directConnect": false,
// 				"greetingId": 0,
// 				"isCircle": false,
// 				"isCustomTranscriptionLanguage": false,
// 				"transcriptionLanguage": ""
// 			},
// 		},
// 		"groupList": ["all_contacts", "all_contacts", "15", "13", "14", ],
// 		"specialGroups": {
// 			"all_contacts": {
// 				"directConnect": false,
// 				"greetingId": 0,
// 				"isCustomForwarding": false,
// 				"isCustomGreeting": false,
// 				"isCustomDirectConnect": false,
// 				"disabledForwardingIds": {},
// 				"isCustomTranscriptionLanguage": false,
// 				"transcriptionLanguage": "",
// 				"id": "all_contacts",
// 				"name": "All Contacts"
// 			},
// 			"blocked_callers": {
// 				"directConnect": false,
// 				"greetingId": 0,
// 				"isCustomForwarding": false,
// 				"isCustomGreeting": false,
// 				"isCustomDirectConnect": false,
// 				"disabledForwardingIds": {},
// 				"isCustomTranscriptionLanguage": false,
// 				"transcriptionLanguage": "",
// 				"id": "blocked_callers",
// 				"name": "Anonymous Callers"
// 			}
// 		},
// 		"lowBalanceNotificationEnabled": false,
// 		"voicemailFeature1": true,
// 		"emailAddresses": ["googleemailaddress@gmail.com"]
// 	}
// }