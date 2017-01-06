const getRequest = require('./getRequest');
const tokenStore = require('./tokenStore');
const getCDATASectionsByTagName = require('./getElementsShims').getCDATASectionsByTagName;
const methodUris = require('./uris').methodUris;

const parsePhoneInfo = (doc) => {
    let cdata = getCDATASectionsByTagName(doc, 'json');
    cdata = String(cdata).trim();
    const i = cdata.indexOf('{');
    const j = cdata.lastIndexOf('}') + 1;
    cdata = cdata.substring(i, j);
    try {
        cdata = JSON.parse(cdata);
    } catch (err) {
        throw new Error('Unable to parse cdata from getPhoneInfo');
    }
    const phoneArr = Object.keys(cdata.phones).map((p) => {
        return cdata.phones[p];
    });
    return phoneArr;
};

const getPhoneInfo = (tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        getRequest(
            methodUris.getPhoneInfo,
            {
                options: {
                    responseType: 'document',
                },
            },
            resp => resolve(parsePhoneInfo(resp))
        );
    });
};

module.exports = getPhoneInfo;
