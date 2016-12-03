const getRequest = require('./getRequest');
const methodUris = require('./uris').methodUris;

// TODO: This needs getJSONfromResponseCDATA from getBox -- however, that function needs
// to be made much more generic, as right now it has functions specific to dealing with
// the message blocks in the getBox call.

// return a bunch of data about the phone configuration
// see bottom of file for sample response, it's pretty large.
// NOT TESTED 02Dec2016 NOT WORKING

function getJSONfromResponseCDATA(resp) {
    return resp;
}

const getPhoneInfo = (tokens, callback) => {
    getRequest(
        methodUris.getPhoneInfo,
        {
            options: {
                responseType: 'document',
            },
        },
        (resp) => {
            callback(getJSONfromResponseCDATA(resp));
        }
    );
};

module.exports = getPhoneInfo;
