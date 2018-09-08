const flat = require('flat');

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
  let msg = '';
  if (typeof logStatement === 'string') {
    msg = ` msg="${logStatement.replace(/"/g, '\'')}"`;
  } else if (logStatement.msg) {
    msg = ` msg="${logStatement.msg.replace(/"/g, '\'')}"`;
    delete logStatement.msg;
  } else if (logStatement.message) {
    msg = ` msg="${logStatement.message.replace(/"/g, '\'')}"`;
    delete logStatement.message;
  }
  const miscTags = tags.filter(r => !['debug', 'warning', 'error', 'fatal'].includes(r));
  const tag = miscTags.length > 0 ? ` tag="${miscTags.join(',')}"` : '';
  const obj = typeof logStatement === 'object' ? flat(logStatement, 2) : '';
  let objStr = '';
  Object.keys(obj).forEach(key => {
    const val = typeof obj[key] === 'string' ? `"${obj[key]}"` : obj[key];
    objStr = `${objStr} ${key}=${val}`;
  });
  const out = `${level}${msg}${tag}${objStr}`.replace(/[\r\n]+/g, ' ');
  return out;
};
