// const assert = require('assert');
const entries = require('object.entries');
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

// use window XMLHttpRequest or require one if it's not there, see comments in postRequest also
let XMLHR;
let getElementsByName;
let request;
let DOMParser;

if (typeof window !== 'undefined') {
    XMLHR = window.XMLHttpRequest;
} else {
    request = require('request').defaults({ jar: true });
    DOMParser = require('xmldom').DOMParser;
    getElementsByName = function (arg) {
        const returnList = [];
        const buildReturn = (startPoint) => {
            Object.values(startPoint).forEach((child) => {
                if (child.nodeType === 1) {
                    if (child.getAttribute('name') === arg) {
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

// params = parameters to send to server
// options = {
//     responseType: one of 'json', 'document', or 'response' / '' .. returns a json object, a document object, or just whatever the native response is.
// }

const getRequest = XMLHR ? // Browser getRequest
(uri, { params = {}, options = {} } = {}, callback = null) => {
    const xhr = new XMLHR();
    const paramsArr = [];
    let paramStr = '';

    Object.entries(params).forEach((p) => {
        paramsArr.push(`${encodeURIComponent(p[0])}=${encodeURIComponent(p[1])}`);
    });
    if (paramStr.length) {
        paramStr = `?${paramsArr.join('&')}`;
    }
    xhr.open('GET', uri);
    xhr.withCredentials = true;

    switch (options.responseType) {
        case 'json':
            xhr.responseType = 'json';
            break;
        case 'document':
            xhr.responseType = 'document';
            break;
        case 'response':
        default:
            xhr.responseType = '';
            break;
    }
    if (callback != null) {
        xhr.onload = (/* err */) => {
            // console.warn('**** get onload xhr=', xhr);
            switch (xhr.responseType) {
                // eslint no-case-declarations: 0
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
    xhr.send(`${uri}${paramStr}`);
}
: // Node getRequest
(url, { params = {}, options = {} } = {}, callback = null) => {
    console.warn('*** node specific getRequest');
    request.get({ url, qs: params }, (error, response, body) => {
        switch (options.responseType) {
            case 'json':
                callback(JSON.parse(body));
                console.warn('*** get body returned as json');
                break;
            case 'document':
                const doc = new DOMParser().parseFromString(body);
                doc.getElementsByName = getElementsByName.bind(doc);
                callback(doc);
                console.warn('*** get body returned as doc');
                break;
            case '': // fallthrough
            default:
                callback(body);
                console.warn('*** get body returned as text');
                break;
        }
    });
};

module.exports = getRequest;
