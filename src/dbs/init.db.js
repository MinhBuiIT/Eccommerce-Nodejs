'use strict';
const moongoose = require('mongoose');
const { connectCount } = require('../helpers/check.connect');
const { db } = require('../configs/config');

const URL_MONGO = `mongodb://${db.host}:${db.port}/${db.name}`;
console.log(URL_MONGO);
class Database {
  constructor() {
    this.connect();
  }
  connect(type = 'mongo') {
    if (type === 'mongo') {
      //Giả sử trong mtr dev
      if (1 === 1) {
        moongoose.set('debug', true);
        moongoose.set('debug', { color: true });
      }
      moongoose
        .connect(URL_MONGO, {
          maxPoolSize: 50
        })
        .then(() => {
          console.log('Connect MongoDB success');
          console.log(`Number of connections::: ${connectCount()}`);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}
const instance = Database.getInstance();
module.exports = instance;
