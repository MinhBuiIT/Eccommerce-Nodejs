const crypto = require('crypto');
const createKey = () => {
  const privateKey = crypto.randomBytes(64).toString('hex');
  const publicKey = crypto.randomBytes(64).toString('hex');
  return { publicKey, privateKey };
};
module.exports = createKey;
