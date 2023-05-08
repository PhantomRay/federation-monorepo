const isObject = (value: any) => {
  return value && typeof value === 'object' && value.constructor === Object;
};

export const parseWhereCondition = (obj: any, child = false) => {
  if (!isObject(obj)) {
    if (child) return obj;
    else throw new Error('Invalid where condition', obj);
  }

  for (const key in obj) {
    if (key === 'AND' || key === 'OR') {
      if (Array.isArray(obj[key])) {
        for (let item of obj[key]) {
          item = parseWhereCondition(item, true);
        }
      }
    } else if (key === 'not') {
      obj[key] = obj[key] === undefined ? '' : obj[key];
    } else if (isObject(obj[key])) {
      obj[key] = parseWhereCondition(obj[key], true);
    } else if (obj[key] === undefined) {
      obj[key] = '';
    }
  }

  return obj;
};

/**
 * @deprecated use "$extends" instead
 * prevent returning one data when "where" condition has undefined value
 */
export const sanitiseWhereMiddleware = (params, next) => {
  if (params.args?.where) params.args.where = parseWhereCondition(params.args.where);

  return next(params);
};

/**
 * when use "search" in where condition
 * https://www.prisma.io/docs/concepts/components/prisma-client/full-text-search
 * @param keywords
 * @returns
 */
export const parseKeywords = (keywords: string) => {
  if (!keywords) return '';
  // replace non-word characters with &
  return keywords
    .split(/\W+/g)
    .filter((word) => word.trim())
    .join('&');
};
