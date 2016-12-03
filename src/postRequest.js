// Voice API is almost always expecting x-www-form-urlencoded, and newer? Chrome and friends
// only send FormData via multi-part, as per the XHR2 standard.  So, this function converts
// FormData to something that can be used with x-www-form-urlencoded.

// TODO: It seems that encodeURIComponent may be overkill -- encoding an outgoing message results
// in the encoding ending up in the message.  I recall at some point, however, that NOT encoding
// results in the _rnr_se token being ignored, as it usually ends with an "=" sign.  This code
// currently works, so removing the encodeURIComponent needs to be tested, though I am assured
// that that may work correctly... ?

// TODO: we shouldn't even bother with doing the conversion to FormData, and just convert to
// a string that is useful .. for some reason, which I do not remember, I used FormData, and I'm
// pretty sure that it's because at least one request wanted to use multi-part instead of
// x-www-form-urlencoded.

// TODO: There's a bunch of code in here that was intended to attempt to change the implementation
// to allow for Node.js use instead of Browser use. That needs to be re-worked completely, or
// thrown out.  On the bright side, if using FormData() is not a requirement, then we can probably
// use     "node-xmlhttprequest": "git+https://git@github.com/jrwells/node-XMLHttpRequest.git"
// to handle the fact that Node doesn't normally have a XMLHttpRequest object.

const XMLHR = window.XMLHttpRequest; // in Node, this should point to require()'d XMLHttpRequest
const MyFormData = FormData; // in Node, this was pointing to require()'d FormData

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

const postRequest = (uri, { params = {}, options = {} } = {}, callback = null) => {
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

module.exports = postRequest;
