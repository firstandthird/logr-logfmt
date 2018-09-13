const flat = require('flat');
const safeJson = require('json-stringify-safe');
const chalk = require('chalk');
const aug = require('aug');

const defaults = {
  color: false, // set to true to apply color theme
  appColor: false, // set to true to auto-colorize the first tag
  tagColors: {}, // assign a color to a specific tag
  theme: {
    keys: 'blue',
    values: 'white',
    tags: 'gray'
  }
};
const appColors = {};
const availableColors = [
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'red'
];
let lastColorIndex = 0;
exports.log = function(config, tags, logStatement) {
  const options = aug(defaults, config);
  const colors = new chalk.constructor({ enabled: options.color });
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
  if (options.appColor) {
    tags.forEach((tag, i) => {
      let color = options.tagColors[tag];
      if (i === 0 && options.appColor) {
        if (!appColors[tag]) {
          appColors[tag] = availableColors[lastColorIndex];
          lastColorIndex++;
          if (lastColorIndex > availableColors.length - 1) {
            lastColorIndex = 0;
          }
        }
        color = appColors[tag];
      }
      tags[i] = (color) ? colors[color](tag) : colors[options.theme.tags](tag);
    });
  }
  const miscTags = tags.filter(r => !['debug', 'warning', 'error', 'fatal'].includes(r));
  const tag = miscTags.length > 0 ? ` tag="${miscTags.map(t => {
    if (options.tagColors[t]) {
      return colors[options.tagColors[t]](t);
    }
    return t;
  }).join(',')}"` : '';
  // flatten the object to a maximum depth of 2:
  const obj = typeof logStatement === 'object' ? flat(logStatement, { maxDepth: 2 }) : '';
  let objStr = '';
  Object.keys(obj).forEach(key => {
    // msg or message are special fields that will be dealt with below:
    if (key === 'msg' || key === 'message') {
      return;
    }
    let val = typeof obj[key] === 'object' ? safeJson(obj[key]) : obj[key].toString();
    val = colors[options.theme.values](val);
    objStr = `${objStr} ${colors[options.theme.keys](key)}="${val.replace(/"/g, '\'')}"`;
  });
  let msg = '';
  // also if there is a message/msg field, use that for the logfmt msg field:
  // if logStatement was a string just use that string as the logfmt msg:
  if (obj.msg) {
    msg = obj.msg;
  } else if (obj.message) {
    msg = obj.message;
  } else if (typeof logStatement === 'string') {
    msg = logStatement;
  }
  if (msg) {
    msg = ` msg="${msg.replace(/"/g, '\'')}"`;
  }
  const out = `${level}${msg}${tag}${objStr}`.replace(/[\r\n]+/g, ' ');
  return out;
};
