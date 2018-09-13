process.env.LOGR_COLOR = 'true';
const Logr = require('logr');
const logrFmt = require('../index.js');
const tap = require('tap');
const test = tap.test;

test('logfmt plugin will display ansi colors when color is true', (t) => {
  const oldConsole = console.log;
  const logs = [];
  console.log = (data) => {
    logs.push(data);
  };
  const log = Logr.createLogger({
    type: 'logfmt',
    reporters: {
      logfmt: {
        reporter: logrFmt,
        options: {
          tagColors: {
            redpaint: 'red'
          }
        }
      }
    }
  });
  log(['color1', 'gray1', 'gray2', 'redpaint'], { msg: 'testing123', tag: { test: { test: '123' } } });
  log(['color2', 'gray1', 'gray2', 'redpaint'], { msg: 'testing123', tag: { test: { test: '123' } } });
  t.match(logs, ['level=INFO msg="testing123" tag="\u001b[32mcolor1\u001b[39m,\u001b[90mgray1\u001b[39m,\u001b[90mgray2\u001b[39m,\u001b[31mredpaint\u001b[39m" \u001b[36mtag.test\u001b[39m="\u001b[37m{\'test\':\'123\'}\u001b[39m"',
    'level=INFO msg="testing123" tag="\u001b[33mcolor2\u001b[39m,\u001b[90mgray1\u001b[39m,\u001b[90mgray2\u001b[39m,\u001b[31mredpaint\u001b[39m" \u001b[36mtag.test\u001b[39m="\u001b[37m{\'test\':\'123\'}\u001b[39m"']);
  console.log = oldConsole;
  t.end();
});
