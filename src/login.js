const getRequest = require('./getRequest');
const postRequest = require('./postRequest');
const { tokenUris, uriParams, methodUris } = require('./uris');

// Get the GALX and gxf token from the ServiceLoginAuth page
// TODO: In SynerGV 1, we did not have the responseType: document, and so we had to
// manually parse the tokens out of the HTML.  There's possibility of browsers that don't
// support that still being in use, so perhaps there should be a fallback to that method.

// TODO: node.js doesn't have a built in document parser.. so might be worth getting that up
// and running sometime.

// TODO: Should probably consider grabbing the form id "gaia_loginform" and scraping
// all the info from it, as it might be useful to some calls.
// As is, I can't remember why we get the "gxf" token, other than it looks important for
// some reason or other. Might be necessary to get through the signin at gvLogin()

const getGALX = (callback) => {
    getRequest(
        tokenUris.galx,
        {
            params: uriParams.galx,
            options: {
                responseType: 'document',
            },
        },
        (doc) => {
            const tokens = {
                GALX: null,
                gxf: null,
            };
            const galxElements = doc.getElementsByName('GALX');
            // TODO: The errors begin at this line, if you provide an incorrect password.
            // TODO: IMPORTANT!!! If test browser is completely logged out of Google in all tabs, all
            // logins are failing at this line!!! wat?!
            tokens.GALX = galxElements[0].getAttribute('value');

            const gxfElements = doc.getElementsByName('gxf');
            tokens.gxf = gxfElements[0].getAttribute('value');

            callback(tokens);
        }
    );
};

// this is a bit gross, but what it does, is it finds the last script in the file, which is a script
// that contains a javascript code to create an object called gcData which holds almost all of the info
// we could ever want to do whatever requests we need, and display a ton of stuff.
// This parses that script down to just the one javascript object creation string,
// then evals it to correctly parse it.  SynerGV 1 used a rather complex and easily breakable
// method that did not use eval.  We really do need to trust eval in this case, otherwise
// google adding comments to the middle of the JSON breaks things. Trailing commas break things.
// Single quotes break things. Improperly escaped quotes break things. No quotes breaks things.
// So on, so forth.

// 10/29/16: TESTED, WORKS.
// TODO: need to deal with a whole lot of possible error conditions i'm sure.

const gvLogin = ({ username, password, tokens }, callback) => {
    const loginParams = {
        Email: username,
        Passwd: password,
        ...uriParams.mobileLogin,
        ...tokens,
    };
    // TODO: throw an error if username, password, tokens.GALX or tokens.gxf are missing
    postRequest(methodUris.login,
        {
            params: loginParams,
            options: {
                responseType: 'document',
                tokens,
            },
        },
        (doc) => {
            // console.warn('*** expecting doc with gcData', doc);
            const x = doc.getElementsByTagName('script');
            const html = x[x.length - 1].innerText.trim();
            const i = html.indexOf('var _gcData = {');
            const j = html.indexOf('};', i) + 2;
            const tmp = html.substring(i, j);
            let gcData = '';
            try {
                // eslint-disable-next-line
                gcData = eval(`(function() {${tmp}; return _gcData; })();`);
            } catch (err) {
                console.error('**** ERROR EVALING GCDATA!', err);
                console.error('**** attempted eval: ', tmp);
                console.error('**** document is', doc);
                callback({ tokens: null, gcData: null, err: -1 });
                return;
            }
            const newTokens = {
                ...tokens,
                rnr: gcData._rnr_se,
            };

            getRequest(tokenUris.xpc,
                { options: { tokens } },
                (xpcdoc /* , xhr */) => {
                    console.warn('**** xpc token document', xpcdoc);
                    const k = xpcdoc.indexOf('new _cd(\'') + 9;
                    const l = xpcdoc.indexOf('\'', k + 1);
                    const rToken = xpcdoc.substring(k, l);
                    console.warn('**** xpc token=', rToken);
                    newTokens.r = rToken;
                    // can't use params here because the initialauth param has no value.. hmm.
                    // TODO: should probably add 'null' support to the xhrMethods to allow
                    // adding get params with no values.
                    getRequest('https://www.google.com/voice/m?initialauth&pli=1',
                        {},
                        (/* gvxDoc, xhr */) => {
                            // presumably, we are actually logged in here. this may set some
                            // browser cookies.  We'd really like to have a cookie called "gvx",
                            // but it seems rather difficult to get it from a browser context, if
                            // you're javascript code.  That may just be when running in straight
                            // chrome, though, it seems that when using an app platform, we probably
                            // have access to the cookies set. At least on some. ???
                            callback({ tokens: newTokens, gcData });
                        }
                    );
                }
            );
        });
};

// TESTED 10/29/16
// TODO: This is definitely going to need some error handling!!!!
const login = (username, password, callback) => {
    // get GALX and gxf tokens, then use them to actually login.
    // callback will receive the tokens and gcData received from the login sequence.
    getGALX(tokens => gvLogin({
        username,
        password,
        tokens,
    }, callback));
};

module.exports = login;
