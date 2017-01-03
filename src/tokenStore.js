let tokens = {};

const setTokens = (newTokens) => {
    tokens = { ...newTokens };
};

const getTokens = () => tokens;

module.exports = {
    setTokens,
    getTokens,
};
