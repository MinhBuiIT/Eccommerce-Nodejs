const _ = require('lodash');
const { default: mongoose } = require('mongoose');
const getInfoObejct = (obj = {}, keyArr = []) => {
  return _.pick(obj, keyArr);
};
const handleSelectConfig = (unselect = [], isSelect = 1) => {
  return Object.fromEntries(unselect.map((item) => [item, isSelect])); // {name: 0, age: 0}
};
const removeKeyFalsethyObject = (obj = {}) => {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      obj[key] = removeKeyFalsethyObject(obj[key]);
    }
    if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
      delete obj[key];
    }
  });
  return obj;
};
/**
 * {
 *    a: 1
 *   b: {
 *    c: 2
 *    d: {
 *     e: 3
 *    }
 *  }
 * }
 * => {
 *  a: 1
 * b.c: 2
 * b.d.e: 3
 * }
 */
const covertNestedObjectToStringKeyValue = (obj = {}, keyNested = '') => {
  let final = {};
  Object.keys(obj).forEach((key) => {
    const keyFinal = keyNested ? `${keyNested}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      final = { ...covertNestedObjectToStringKeyValue(obj[key], keyFinal), ...final };
    } else {
      final[keyFinal] = obj[key];
    }
  });
  return final;
};

const converStringToObjectId = (str) => {
  return new mongoose.Types.ObjectId(str);
};
module.exports = {
  getInfoObejct,
  handleSelectConfig,
  removeKeyFalsethyObject,
  covertNestedObjectToStringKeyValue,
  converStringToObjectId
};
