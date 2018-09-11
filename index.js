const flat = require('flat');
const safeJson = require('json-stringify-safe');

exports.log = function(options, tags, logStatement) {
  // assign the level key, by default it will be INFO:
  let level = 'level=INFO';
  if (tags.includes('fatal')) {
    level = 'level=FATAL';
  } else if (tags.includes('error')) {
    level = 'level=ERROR';
  } else if (tags.includes('warning')) {
    level = 'level=WARN';
  } else if (tags.includes('debug')) {
    level = 'level=DEBUG';
  }
  const miscTags = tags.filter(r => !['debug', 'warning', 'error', 'fatal'].includes(r));
  const tag = miscTags.length > 0 ? ` tag="${miscTags.join(',')}"` : '';
  // flatten the object to a maximum depth of 2:
  const obj = typeof logStatement === 'object' ? flat(logStatement, { maxDepth: 2 }) : '';
  let objStr = '';
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/"/g, '\'');
    }
    // msg or message are special fields that will be dealt with below:
    if (key === 'msg' || key === 'message') {
      return;
    }
    const val = typeof obj[key] === 'object' ? safeJson(obj[key]) : `"${obj[key]}"`;
    objStr = `${objStr} ${key}=${val}`;
  });
  let msg = '';
  // also if there is a message/msg field, use that for the logfmt msg field:
  // if logStatement was a string just use that string as the logfmt msg:
  if (obj.msg) {
    msg = ` msg="${obj.msg}"`;
    delete obj.msg;
  } else if (obj.message) {
    msg = ` msg="${obj.message}"`;
    delete obj.message;
  } else if (typeof logStatement === 'string') {
    msg = ` msg="${logStatement.replace(/"/g, '\'')}"`;
  }
  const out = `${level}${msg}${tag}${objStr}`.replace(/[\r\n]+/g, ' ');
  return out;
};
