const synergv = require('..');

const login = synergv.login;

let tokens = { };

const [username, password] = process.argv.slice(2);

const doLogin = (callback) => {
    login(username, password, (t) => {
        tokens = t;
        module.exports.tokens = tokens;
        callback();
    });
};

if (require.main === module) {
    doLogin(() => {
        console.warn('**** tokens received');
        console.warn(tokens);
    });
}

module.exports = {
    login: doLogin,
    tokens,
};
