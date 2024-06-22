'use strict';
const mongoose = require('mongoose');
const os = require('os');
const process = require('process');
const _SECOND = 5000;
//Kiểm tra hệ thống có bao nhiêu connect
const connectCount = () => {
  const count = mongoose.connections.length;
  return count;
};
//Kiểm tra hệ thống của chịu được bao nhiêu connect đến
const checkOverloadConnect = () => {
  setInterval(() => {
    const numConnect = mongoose.connections.length;
    const numCpuCore = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    //Giả sử mỗi core cpu chỉ chịu được 5 connect => con số này có thể thay đổi tùy vào hệ thống nhưng phải dưới mức cho phép để ta có thể nâng cấp hệ thống để xử lý tránh crash server
    const maxConect = numCpuCore * 5;
    console.log(`Number of connections: ${numConnect}`);
    console.log(`Memory usage: ${memoryUsage / (1024 * 1024)}MB`);
    if (numConnect > maxConect) {
      console.log('Server overload detected');
    }
  }, _SECOND);
};
module.exports = { connectCount, checkOverloadConnect };
