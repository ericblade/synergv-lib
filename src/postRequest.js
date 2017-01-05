// Voice API is almost always expecting x-www-form-urlencoded, and newer? Chrome and friends
// only send FormData via multi-part, as per the XHR2 standard.  So, this function converts
// FormData to something that can be used with x-www-form-urlencoded.

// TODO: It seems that encodeURIComponent may be overkill -- encoding an outgoing message results
// in the encoding ending up in the message.  I recall at some point, however, that NOT encoding
// results in the _rnr_se token being ignored, as it usually ends with an "=" sign.  This code
// currently works, so removing the encodeURIComponent needs to be tested, though I am assured
// that that may work correctly... ?

// const assert = require('assert');

// shims for node.
const entries = require('object.entries'); // shouldn't be needed if using node >= 7.1.0 or 6.8.1 with --harmony
const values = require('object.values');

// const obj = { a: 1, b: 2, c: 3 };
// const expected = [['a', 1], ['b', 2], ['c', 3]];

// if (typeof Symbol === 'function' && typeof Symbol() === 'symbol') {
//     // for environments with Symbol support
//     const sym = Symbol();
//     obj[sym] = 4;
//     obj.d = sym;
//     expected.push(['d', sym]);
// }

// assert.deepEqual(entries(obj), expected);

if (!Object.entries) {
    entries.shim();
}

if (!Object.values) {
    values.shim();
}

if (!Object.prototype.entries) {
    Object.prototype.entries = entries.getPolyfill();
}

// assert.deepEqual(Object.entries(obj), expected);

// if browser, use built-in XMLHttpRequest, if not require it in.
// if not browser, we are assuming that there is no getElementsByName in xmldoc module, used by
// the fork of node-xmlhttprequest we are using. So shim that in as well.

let XMLHR;
let getElementsByName;
let request;
let DOMParser;

if (typeof window !== 'undefined') {
    XMLHR = window.XMLHttpRequest;
} else {
    request = require('request').defaults({ jar: true });
    DOMParser = require('xmldom').DOMParser;
    getElementsByName = require('./getElementsShims').getElementsByName;
}

const urlEncodeFormData = (fd) => {
    let s = '';

    const encode = str => encodeURIComponent(str).replace(/%20%/g, '+');

    for (const pair of fd.entries()) {
        const p = pair[1];
        if (typeof p[1] === 'string') {
            s += `${s ? '&' : ''}${encode(p[0])}=${encode(p[1])}`;
        }
    }
    return s;
};

const postRequest = XMLHR ? // Browser version of postRequest function
(uri, { params = {}, options = {} } = {}, callback = null) => {
    if (!options.tokens) {
        if (callback != null) {
            callback(new Error('*** Tokens must be supplied to options for post requests'));
            return;
        }
    }
    const postData = { ...params };
    if (options.tokens.rnr) {
        postData._rnr_se = options.tokens.rnr;
    }

    const formData = [];

    Object.entries(postData).forEach((p) => {
        formData.push([p[0], p[1]]);
    });

    const xhr = new XMLHR();
    xhr.open('POST', uri);
    xhr.withCredentials = true;
    switch (options.responseType) {
        case 'json':
            xhr.responseType = 'json';
            break;
        case 'document':
            // console.warn('*** setting document responseType');
            xhr.responseType = 'document';
            break;
        case 'response':
        default:
            xhr.responseType = '';
            break;
    }

    if (callback != null) {
        xhr.onload = (...args/* err */) => {
            // console.warn('*** received postRequest response', xhr);
            switch (xhr.responseType) {
                case 'document':
                    const document = xhr.responseXML;
                    if (!document.getElementsByName) { // node xmldoc doesn't do getElementsByName
                        document.getElementsByName = getElementsByName.bind(document);
                    }
                    callback(document, xhr);
                    break;
                case 'json':
                case '':
                default:
                    callback(xhr.response, xhr);
                    break;
            }
        };
    }
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(urlEncodeFormData(formData));
}
: // Node version of postRequest function.
(url, { params = {}, options = {} } = {}, callback = null) => {
    // console.warn('**** node specific postRequest', params);
    const postData = params;
    if (options.tokens) {
        if (options.tokens.rnr) {
            postData._rnr_se = options.tokens.rnr;
        }
        if (options.tokens.GALX) {
            postData.GALX = options.tokens.GALX;
        }
        if (options.tokens.gxf) {
            postData.gxf = options.tokens.gxf;
        }
    }
    request.post({ url, form: postData }, (error, response, body) => {
        // console.warn('***', response.request.uri);
        switch (options.responseType) {
            case 'json':
                try {
                    callback(JSON.parse(body));
                    // console.warn('**** posted data back as json');
                } catch (err) {
                    console.warn('**** unable to JSON parse response!!!! response was', body);
                    callback(body);
                }
                break;
            case 'document':
                const doc = new DOMParser().parseFromString(body);
                doc.getElementsByName = getElementsByName.bind(doc);
                callback(doc);
                // console.warn('**** posted data back as document');
                break;
            case '': // fallthrough
            default:
                callback(body);
                // console.warn('**** posting data back without parsing...');
                break;
        }
    });
};


module.exports = postRequest;
