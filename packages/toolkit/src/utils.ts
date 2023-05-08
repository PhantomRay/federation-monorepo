import { Snowflake } from '@sapphire/snowflake';

import { MetaDTO } from './types/meta.dto';

const epoch = new Date('2023-02-11T00:00:00.000Z');
const snowflake = new Snowflake(epoch);

const generateSnowflakeId = () => {
  return snowflake.generate().toString(36);
};

const parseHeaders = (headers): MetaDTO => {
  return {
    make: headers['x-make'],
    model: headers['x-model'],
    os: headers['x-os'],
    os_ver: headers['x-os-ver'],
    app: headers['x-app'],
    app_ver: headers['x-app-ver'],
    uid: headers['x-uid'],
    ip: headers['CF-Connecting-IP'] || headers['x-forwarded-for']
  };
};

const getClientIP = (req) => {
  const ip =
    req.headers['CF-Connecting-IP'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '';
  return ip.split(',')[0] || '';
};

const getBoolean = (str) => {
  if (typeof str === 'boolean') return str;
  if (str === 'true') return true;
  if (str === 'false') return false;
  return undefined;
};

function toCamelCase(str) {
  if (str === void 0) {
    str = '';
  }
  if (!str) return '';
  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/[^A-Za-z0-9]+/g, '$')
    .replace(/([a-z])([A-Z])/g, function (m, a, b) {
      return a + '$' + b;
    })
    .toLowerCase()
    .replace(/(\$)(\w)/g, function (m, a, b) {
      return b.toUpperCase();
    });
}

/**
 * convert object keys to camel case, including nested objects
 * @param obj
 */
const camelCaseKeys = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => camelCaseKeys(item));
  }

  if (obj instanceof Date) {
    return obj;
  }

  return Object.keys(obj).reduce((result, key) => {
    const value = obj[key];
    const camelKey = toCamelCase(key);
    result[camelKey] = camelCaseKeys(value);
    return result;
  }, {});
};

export { getBoolean, generateSnowflakeId, parseHeaders, getClientIP, camelCaseKeys };
