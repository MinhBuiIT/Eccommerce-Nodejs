const dotenv = require('dotenv');
dotenv.config();
const dev = {
  app: {
    port: process.env.DEV_PORT || 3055
  },
  db: {
    host: process.env.DEV_DB_HOST || 'localhost',
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || 'eccomerceDev'
  }
};
const pro = {
  app: {
    port: process.env.PRO_PORT || 3000
  },
  db: {
    host: process.env.PRO_DB_HOST || 'localhost',
    port: process.env.PRO_DB_PORT || 27017,
    name: process.env.PRO_DB_NAME || 'eccomerce'
  }
};
const config = { dev, pro };
const env = process.env.NODE_ENV || 'dev';
module.exports = config[env];
