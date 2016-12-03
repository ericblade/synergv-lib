// See comments on postRequest.js

const XMLHR = window.XMLHttpRequest;
const MyFormData = FormData;

// params = parameters to send to server
// options = {
//     responseType: one of 'json', 'document', or 'response' / '' .. returns a json object, a document object, or just whatever the native response is.
// }

const getRequest = (uri, { params = {}, options = {} } = {}, callback = null) => {
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

module.exports = getRequest;
