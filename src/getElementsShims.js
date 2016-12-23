// a shim to be inserted into a xmldom Document or Element object, as
// the xml parser doesn't care about Class names, but a HTML parser would.

// You should bind it with two arguments, so that the first incoming object is always
// the Document or Element that needs to be searched.  I have tried just binding this,
// and then using this as the item to search, but that failed for reasons I am not sure of,
// and simply binding an argument to the function call fixed, so I did not investigate
// further.

const getElementsByClassName = (d, search) => {
    const results = [];
    const elements = d.getElementsByTagName('*');
    const pattern = new RegExp(`(^|\\s)${search}(\\s|$)`);
    for (const element in elements) {
        if (pattern.test(element.getAttribute('class'))) {
            results.push(element);
        }
    }
    return results;
};

// a shim to be inserted into a xml Document or Element object, as the xml parser doesn't care
// about Names but a HTML parser would.

// For some reason, this works fine when bound with just the correct "this" as the Element or
// Document.  *shrug* I wonder if that's because this is created with a function declaration, but
// the above is created with an arrow ? Worth knowing, since this is all relatively new stuff
// in the Javascript world.

const getElementsByName = function (arg) {
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
    };
    buildReturn(this.childNodes);
    return returnList;
};

// This one is not a function found normally in a HTML Document, but it's of use here.
// Returns an Array or Array-Like containing the CDATA of all items with the given tag name.

const getCDATASectionsByTagName = function(doc, tag) {
    const results = [];
    const elementList = doc.getElementsByTagName(tag);
    for (const element in elementList) {
        let text = element.innerHTML; // browser
        if (!text) {
            text = element.childNodes[0].data; // TODO: In Node xmldom, this extracts the entire text without having to further parse it. We should see if that also works in browser, or something similar can be done in browser.
        } else {
            const i = text.indexOf('{');
            const j = text.indexOf(']]>');
            text = text.substring(i, j);
        }
        results.push(text);
    }
    return results;
}

module.exports = {
    getElementsByClassName,
    getElementsByName,
    getCDATASectionsByTagName,
};
