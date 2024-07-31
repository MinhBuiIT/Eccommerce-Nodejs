const jwt = require('jsonwebtoken');
const createTokenAuth = async ({ payload, publicKey, privateKey, exp }) => {
  const access_token = jwt.sign(payload, privateKey, {
    expiresIn: '2 days'
  });
  const options = exp ? {} : { expiresIn: '7 days' };
  const payloadRefresh = exp ? { ...payload, exp } : payload;
  const refresh_token = jwt.sign(payloadRefresh, publicKey, options);

  //

  // jwt.verify(access_token, privateKey, (err, decoded) => {
  //   console.log('Decode::', decoded);
  // });
  return {
    access_token,
    refresh_token
  };
};

module.exports = { createTokenAuth };
