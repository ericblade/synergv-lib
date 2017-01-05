const postRequest = require('./postRequest');
const tokenStore = require('./tokenStore');
const methodUris = require('./uris').methodUris;

// TESTED 10/29/16
// TODO: Needs to handle errors? how does this error? can it error?
// { ok: true, credit: 900, decoratedDefaultAmount: "$10.00", defaultAmount: "10", formattedCredit: "$0.09", minutes: 2000, paidCredit: "0", sms: 2000,
//   validAmounts: [ 10, 25, 50 ], decoratedValidAmounts{ { 0:"$10.00", 1:"$25.00", 2:"$50.00" }}

const getBillingCredit = (tokens = tokenStore.getTokens()) => {
    return new Promise((resolve, reject) => {
        postRequest(
            methodUris.getBillingCredit,
            {
                options: {
                    tokens,
                    responseType: 'json'
                }
            },
            (resp) => resolve(resp)
        );
    });
};

module.exports = getBillingCredit;
