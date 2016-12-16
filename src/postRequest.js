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

if (typeof window !== 'undefined') {
    XMLHR = window.XMLHttpRequest;
} else {
    XMLHR = require('xmlhttprequest-cookie').XMLHttpRequest;
    getElementsByName = function (arg) {
        console.warn('**** getElementsByName', arg);
        const returnList = [];
        const buildReturn = (startPoint) => {
            Object.values(startPoint).forEach((child) => {
                if (child.nodeType === 1) {
                    if (child.getAttribute('name') === arg) {
                        console.warn('**** get ElementsByName found', arg, child);
                        returnList.push(child);
                    }
                    if (child.childNodes.length) {
                        buildReturn(child.childNodes);
                    }
                }
            });
            // for (const child in startPoint) {
            //     if (startPoint[child].nodeType != 1) {
            //         continue;
            //     }
            //     if (startPoint[child].getAttribute('name') == arg) returnList.push(startPoint[child]);
            //     if (startPoint[child].childNodes.length) {
            //         buildReturn(startPoint[child].childNodes);
            //     }
            // }
        };
        buildReturn(this.childNodes);
        return returnList;
    };
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

const postRequest = (uri, { params = {}, options = {} } = {}, callback = null) => {
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
};

module.exports = postRequest;
