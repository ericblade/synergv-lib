const synergv = require('..');
const tokenStore = require('..').tokenStore;

const login = synergv.login;

const [username, password] = process.argv.slice(2);

const doLogin = () => login(username, password).then((params) => {
    tokenStore.setTokens(params.tokens);
    return params;
});

if (require.main === module) {
    doLogin().then(({ tokens, gcData }) => {
        console.warn('**** tokens received');
        console.warn(tokenStore.getTokens());
        console.warn('**** gcData received', gcData);
        return { gcData };
    });
}

module.exports = {
    login: doLogin,
};
