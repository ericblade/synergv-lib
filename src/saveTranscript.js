// TODO: Not tested.

// Request URL:https://www.google.com/voice/b/0/inbox/saveTranscript/
// Request Method:POST
// Status Code:200

// Form Data
// callId:POSOQSVQLPRTTZPSLVQTLKRNWOWKYPNSHHIZLSOI
// trans:Hi, this is brad with a star heating and cooling. I have you scheduled for service. I'm making sure this one's going to be home before I come over please call me back area code 734 778 5878. test
// _rnr_se:(_rnr_se)

const postRequest = require('./postRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

const saveTranscript = (callId, trans, tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        const params = {
            callId,
            trans,
        };
        postRequest(
            methodUris.saveTranscript,
            {
                params,
                options: {
                    tokens,
                    responseType: 'json',
                },
            },
            resp => resolve(resp)
        );
    })
};

module.exports = saveTranscript;
