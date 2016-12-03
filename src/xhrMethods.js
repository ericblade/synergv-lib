// This file only remains for reference, in case anything in the new version is completely broken.

/* eslint "global-require": 0 */
/* eslint "no-case-declarations": 0 */

// TODO: There does not seem to be any possible way, without development on one or both of these
// libraries for node.js, to get "node-form-data" and "node-xmlhttprequest" to be compatible
// with each other.  node-form-data is a data stream (why?) and node-xmlhttprequest takes strings
// or buffers.  These do not sanely go together, so some sort of connector needs to be built or
// obtained, that will manage to do so, otherwise we end up replacing a bunch of code that works
// perfectly fine in browser, with a bunch of node-specific code, or doing it in a less than
// optimal way in browser.

// as is, there is entirely too much node-specific code just to handle that node hasn't implemented
// ES6 imports yet.

let XMLHR;
let getElementsByName;
let MyFormData;
// let isNodeJs = false;

// node.js compatibility code here

if (typeof window === 'undefined') {
    // isNodeJs = true;
    // eslint ignore-next-line
    XMLHR = require('node-xmlhttprequest').XMLHttpRequest;
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
    MyFormData = require('form-data');
} else {
    XMLHR = window.XMLHttpRequest;
    MyFormData = FormData;
}

// params = parameters to send to server
// options = {
//     responseType: one of 'json', 'document', or 'response' / '' .. returns a json object, a document object, or just whatever the native response is.
// }
const xmlGetRequest = (uri, { params = {}, options = {} } = {}, callback = null) => {
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
};

// Voice API is almost always expecting x-www-form-urlencoded, and newer? Chrome and friends
// only send FormData via multi-part, as per the XHR2 standard.  So, this function converts
// FormData to something that can be used with x-www-form-urlencoded.

const urlEncodeFormData = (fd) => {
    let s = '';

    const encode = str => encodeURIComponent(str).replace(/%20%/g, '+');

    for (const pair of fd.entries()) {
        if (typeof pair[1] == 'string') {
            console.warn(`**** encoding ${pair[0]}`);
            s += `${s ? '&' : ''}${encode(pair[0])}=${encode(pair[1])}`;
        }
    }
    return s;
};

const xmlPostRequest = (uri, { params = {}, options = {} } = {}, callback = null) => {
    console.warn(`**** postRequest params=`, params);

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

    console.warn('*** creating formdata');
    const formData = new MyFormData();

    Object.entries(postData).forEach((p) => {
        console.warn('*** ', p[0], p[1]);
        formData.append(p[0], p[1]);
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
            console.warn('*** onLoad arugments', args);
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
    // eslint-disable-next-line no-underscore-dangle
    if (formData._streams) {
        // xhr.send(formData._streams.join(null));
        formData.submit(uri, xhr.onload);
    } else {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(urlEncodeFormData(formData));
    }
};

export { xmlGetRequest, xmlPostRequest };

/*
const getResponseFromGet = (uri, params = {}, callback) => {
    const xhr = new XMLHR();
    const str = [];
    let paramString = '';

    Object.entries(params).forEach((param) => {
        str.push(`${encodeURIComponent(param[0])}=${encodeURIComponent(param[1])}`);
    });
    // for (const p in getParams) {
    //     str.push(`${encodeURIComponent(p)}=${encodeURIComponent(getParams[p])}`);
    // }
    if (str.length) {
        paramString = `?${str.join('&')}`;
    }

    xhr.open('GET', uri);
    xhr.withCredentials = true;
    xhr.onload = () => callback(xhr.response, xhr);
    xhr.send(`${uri}${paramString}`);
};

const getDocumentFromGet = (uri, params = {}, callback) => {
    const xhr = new XMLHR();
    const str = [];
    let paramString = '';

    Object.entries(params).forEach((param) => {
        str.push(`${encodeURIComponent(param[0])}=${encodeURIComponent(param[1])}`);
    });

    // for (var p in getParams) {
    //     str.push(`${encodeURIComponent(p)}=${encodeURIComponent(getParams[p])}`);
    // }
    if (str.length) {
        paramString = `?${str.join('&')}`;
    }

    xhr.open('GET', uri);
    xhr.responseType = 'document';
    xhr.withCredentials = true;
    xhr.onload = () => callback(xhr.responseXML);
    console.warn(`*** getDocumentFromGet ${uri}${paramString}`);
    xhr.send(`${uri}${paramString}`);
};

const getJSONFromGet = (uri, params = {}, callback) => {
    const xhr = new XMLHR();
    const str = [];
    let paramString = '';
    Object.entries(params).forEach((param) => {
        str.push(`${encodeURIComponent(param[0])}=${encodeURIComponent(param[1])}`);
    });

    // for (var p in getParams) {
    //     str.push(`${encodeURIComponent(p)}=${encodeURIComponent(getParams[p])}`);
    // }
    if (str.length) {
        paramString = `?${str.join('&')}`;
    }

    xhr.open('GET', uri);
    xhr.responseType = 'json';
    xhr.withCredentials = true;
    xhr.onload = () => callback(xhr.response);
    xhr.send(`${uri}${paramString}`);
};

function getResponseFromPost(uri, postData, callback) {
    var params = postData || {};
    if (config.tokens.rnr) {
        params._rnr_se = config.tokens.rnr;
    }
    let formData = new FormData();
    for (let p in params) {
        formData.append(p, params[p]);
    }
    let xhr = new XMLHR();
    xhr.open('POST', uri);
    xhr.withCredentials = true;
    xhr.onload = (e) => {
        callback(xhr.response);
    }
    xhr.send(formData);
}

function getDocumentFromPost(uri, postData = {}, callback) {
    const params = { ...postData };
    if (config.tokens.rnr) {
        params._rnr_se = config.tokens.rnr;
    }
    const formData = new FormData();
    Object.entries(params).forEach((param) => {
        formData.append(param[0], param[1]);
    });
    // for (let p in params) {
    //     formData.append(p, params[p]);
    // }
    const xhr = new XMLHR();
    xhr.open('POST', uri);
    xhr.withCredentials = true;
    xhr.responseType = 'document';
    xhr.onload = () => {
        callback(xhr.responseXML);
    };
    xhr.send(formData);
}

function getJSONFromPost(uri, postData = {}, callback) {
    const params = { ...postData };
    if (config.tokens.rnr) {
        params._rnr_se = config.tokens.rnr;
    }
    // let formData = new FormData();
    // for(let p in params) {
    //     formData.append(p, params[p]);
    // }
    const xhr = new XMLHR();
    const str = [];
    let paramString = '';

    Object.entries(params).forEach((param) => {
        str.push(`${encodeURIComponent(param[0])}=${encodeURIComponent(param[1])}`);
    });

    // for (var p in params) {
    //     str.push(`${encodeURIComponent(p)}=${encodeURIComponent(params[p])}`);
    // }
    if (str.length) {
        paramString = str.join('&');
    }
    xhr.open('POST', uri);
    xhr.withCredentials = true;
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = () => callback(xhr.response);
    // xhr.send(formData);
    // xhr.send(params);
    xhr.send(paramString);
}
*/
