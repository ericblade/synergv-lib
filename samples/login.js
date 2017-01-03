const synergv = require('..');
const tokenStore = require('..').tokenStore;

const login = synergv.login;

const [username, password] = process.argv.slice(2);

const doLogin = () => {
    return new Promise((resolve, reject) => {
        login(username, password, (tokens) => {
            tokenStore.setTokens(tokens);
            resolve(tokens);
        });
    });
};

if (require.main === module) {
    doLogin(() => {
        console.warn('**** tokens received');
        console.warn(tokenStore.getTokens());
    });
}

module.exports = {
    login: doLogin,
    // tokens,
};
