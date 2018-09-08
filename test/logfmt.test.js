const Logr = require('logr');
const logrFmt = require('../index.js');
const tap = require('tap');
const test = tap.test;

test('can load the logfmt  plugin ', (t) => {
  t.plan(1);
  const log = Logr.createLogger({
    type: 'logfmt',
    reporters: {
      logfmt: {
        reporter: logrFmt
      }
    }
  });
  t.equal(typeof log, 'function', 'should register a "log" function');
});

test('logfmt plugin can convert tags to the appropriate logfmt "level" keys', (t) => {
  const oldConsole = console.log;
  const logs = [];
  console.log = (data) => {
    logs.push(data);
  };
  const log = Logr.createLogger({
    type: 'logfmt',
    reporters: {
      logfmt: {
        reporter: logrFmt
      }
    }
  });
  log(['debug', 'warning', 'error', 'fatal'], 'a fatal log statement');
  log(['debug', 'warning', 'error'], 'a log statement');
  log(['debug', 'warning'], 'a log statement');
  log(['debug'], 'a log statement');
  log('a log statement');
  console.log = oldConsole;
  t.match(logs.length, 5, 'prints all tags');
  t.match(logs[0], 'level=FATAL');
  t.match(logs[1], 'level=ERROR');
  t.match(logs[2], 'level=WARN');
  t.match(logs[3], 'level=DEBUG');
  t.match(logs[4], 'level=INFO');
  t.end();
});

test('logfmt plugin can convert mesage content to the logfmt "msg" key', (t) => {
  const oldConsole = console.log;
  const logs = [];
  console.log = (data) => {
    logs.push(data);
  };
  const log = Logr.createLogger({
    type: 'logfmt',
    reporters: {
      logfmt: {
        reporter: logrFmt
      }
    }
  });
  log('a log statement');
  log({ msg: 'a log statement' });
  log({ message: 'a log statement' });
  log({ notAMEssage: 'not a log statement' });
  console.log = oldConsole;
  t.match(logs.length, 4, 'prints all tags');
  t.match(logs[0], 'level=INFO msg="a log statement"');
  t.match(logs[1], 'level=INFO msg="a log statement"');
  t.match(logs[2], 'level=INFO msg="a log statement"');
  t.notMatch(logs[3], 'level=INFO msg="a log statement"');
  t.end();
});

test('logfmt plugin can convert other tags to the logfmt "tag" key', (t) => {
  const oldConsole = console.log;
  const logs = [];
  console.log = (data) => {
    logs.push(data);
  };
  const log = Logr.createLogger({
    type: 'logfmt',
    reporters: {
      logfmt: {
        reporter: logrFmt
      }
    }
  });
  log(['tag1', 'tag2', 'tag3'], 'a log statement');
  console.log = oldConsole;
  t.match(logs[0], 'level=INFO msg="a log statement" tag="tag1,tag2,tag3"');
  t.end();
});

test('logfmt plugin will convert object to keys up to 2 levels deep', (t) => {
  const oldConsole = console.log;
  const logs = [];
  console.log = (data) => {
    logs.push(data);
  };
  const log = Logr.createLogger({
    type: 'logfmt',
    reporters: {
      logfmt: {
        reporter: logrFmt
      }
    }
  });
  log({
    obj: {
      key: 'a'
    },
    blah: {
      foo: 'test 123'
    },
    debug: 1
  });
  console.log = oldConsole;
  t.match(logs[0], 'level=INFO obj.key="a" blah.foo="test 123" debug=1');
  t.end();
});

test('logfmt plugin will display all features together correctly', (t) => {
  const oldConsole = console.log;
  const logs = [];
  console.log = (data) => {
    logs.push(data);
  };
  const log = Logr.createLogger({
    type: 'logfmt',
    reporters: {
      logfmt: {
        reporter: logrFmt
      }
    }
  });
  log(['error', 'tag1', 'tag2'], {
    message: 'a log statement',
    obj: {
      key: 'a'
    },
    blah: {
      foo: 'test 123'
    },
    debug: 1
  });
  console.log = oldConsole;
  t.match(logs[0], 'level=ERROR msg="a log statement" tag="tag1,tag2" obj.key="a" blah.foo="test 123" debug=1');
  t.end();
});

test('logfmt plugin will escape doublequotes and strip newlines from the message', (t) => {
  const oldConsole = console.log;
  const logs = [];
  console.log = (data) => {
    logs.push(data);
  };
  const log = Logr.createLogger({
    type: 'logfmt',
    reporters: {
      logfmt: {
        reporter: logrFmt
      }
    }
  });
  log(`MongoClient connection created for {"url":"http://example.com&authSource=user","decorate":true}

here are some other things
`);
  log({ message: `MongoClient connection created for {"url":"http://example.com&authSource=user","decorate":true}

here are some other things
` });
  log({ msg: `MongoClient connection created for {"url":"http://example.com&authSource=user","decorate":true}

here are some other things
` });

  console.log = oldConsole;
  t.match(logs[0], 'msg="MongoClient connection created for {\'url\':\'http://example.com&authSource=user\',\'decorate\':true} here are some other things "');
  t.match(logs[1], 'msg="MongoClient connection created for {\'url\':\'http://example.com&authSource=user\',\'decorate\':true} here are some other things "');
  t.match(logs[2], 'msg="MongoClient connection created for {\'url\':\'http://example.com&authSource=user\',\'decorate\':true} here are some other things "');
  t.end();
});
