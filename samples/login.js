const synergv = require('..');
const tokenStore = require('..').tokenStore;

const login = synergv.login;

const [username, password] = process.argv.slice(2);

const doLogin = () => login(username, password).then(tokens => tokenStore.setTokens(tokens));

if (require.main === module) {
    doLogin().then(() => {
        console.warn('**** tokens received');
        console.warn(tokenStore.getTokens());
    });
}

module.exports = {
    login: doLogin,
};
