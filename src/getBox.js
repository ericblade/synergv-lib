const getRequest = require('./getRequest');
const methodUris = require('./uris').methodUris;

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
    getRequest(`${methodUris.getBox}/${label}/?page=p${p || 1}`,
        {
            options: { responseType: 'document' },
        },
        (resp) => {
            callback(getJSONfromResponseCDATA(resp));
        });
};

module.exports = getBox;
