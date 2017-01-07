const postRequest = require('./postRequest');
const methodUris = require('./uris').methodUris;
const tokenStore = require('./tokenStore');

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

// TODO: Potentially Incredibly Useful!!! IF you sendMessage() with an empty message ('') and provide a conversationId,
// TODO: you will receive back a JSON with the conversation data as below, and a blank message will not be sent to the conversation.
// TODO: This means we can query updated conversation data using sendMessage, without having to go and request a new HTML page.

// the returned data from when you provide a conversation id looks like (in the JSON block)
/*
{
    children: [
        {
            callProblem: 0, // ?
            conversationId: "string representing the given conversation",
            cost: 0, // ?
            currency: ""USD"", // ? and yes, that's dual double quotes.
            did: "+12025551212" // the receiving phone number, (ie, this google voice account)
            displayStartDateTime: "1/6/17 3:39 AM", // the time this specific message was sent in the conversation
            displayStartTime: "3:39 AM", // for this specific message
            duration: 0, // ?
            durationMinutes: 0, // ?
            formattedCost: "$0.00", // ?
            fromName: "", // ? seems to always be blank despite the number being in my contacts
            hasMp3: true, // ? seems to always be true
            hasOgg: true, // ? seems to always be true
            id: "string looks like a conversation id, isn't", // looks like the conversation id.. but it seems to refer to the specific message rather than the conversation
            isRead: 1, // ? presumably would be 0 if the thread wasn't marked read.. can individual messages have isRead status separate from the conversation?
            ivrHostname: "", // ?
            message: "string, text of message",
            phoneNumber: "+12025551212", // the phone number of the other end of the conversation (ie, NOT this google voice account)
            relativeStartTime: "17 hours ago", // time for this specific message
            startTime: "string javascript timestamp", // time for this specific message
            type: 10, // 10 for messages TO this account, 11 for messages FROM this account
            unhashedId: "string", // ?
        }
    ],
    code: 0, // ?
    displayNumber: "(202) 555-1212", // the phone number of the other end of the conversation
    displayStartDateTime: "1/6/17 9:30 PM", // now represents the receive date of the MOST RECENT message in the conversation
    displayStartTime: "9:30 PM", // most recent message in the conversation
    duration: 0, // ?
    hasMp3: true, // ? always true?
    hasOgg: true, // ? always true?
    id: "string", // seems to be the conversation id again
    isRead: true, // presumably could also be false
    isSpam: false, // presumably could also be true
    isTrash: false, // presumably could also be true
    labels: [
        "all", "sms", "inbox",
    ],
    messageText: "string", // sadly, still the first message that started the conversation, rather than the most recent
    relativeStartTime: "now", // presumably "now" since we just sent a message
    star: false, // presumably could also be true
    startTime: "string javascript timestamp", // time stamp for MOST RECENT message in conversation
    type: 10, // presumably 10 means the conversation was started by an incoming message, and 11 probably means the conversation was started by an outgoing message,
              // but i have not verified this.
}
*/

const sendMessage = ({ recp, text, conversationId }, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        const params = {
            phoneNumber: recp,
            text,
            id: conversationId || '',
            conversationId: conversationId || '',
        };
        postRequest(
            methodUris.sendMessage,
            {
                options: {
                    tokens,
                    responseType: 'json',
                },
                params,
            },
            resp => resolve(resp),
        );
    });
};

module.exports = sendMessage;
