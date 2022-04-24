import test from 'ava';
import { parseKey, validKey, getAttributes } from './spx/routes.js';

test('validKey valid hostname (truthy)', t => {

  t.truthy(validKey('//brixtol.com'));
  t.log('LINK: //brixtol.com');

  t.truthy(validKey('//www.brixtol.com'));
  t.log('LINK: //www.brixtol.com');

  t.truthy(validKey('www.brixtol.com'));
  t.log('LINK: www.brixtol.com');

  t.truthy(validKey('https://brixtol.com'));
  t.log('LINK: https://brixtol.com');

  t.truthy(validKey('https://www.brixtol.com'));
  t.log('LINK: https://www.brixtol.com');

  t.truthy(validKey('http://brixtol.com'));
  t.log('LINK: http://brixtol.com');

  t.truthy(validKey('http://www.brixtol.com'));
  t.log('LINK: http://www.brixtol.com');

  t.pass();

});

test('validKey invalid hostname (falsy)', t => {

  t.falsy(validKey('//invalid.com'));
  t.log('LINK: //invalid.com');

  t.falsy(validKey('//www.invalid.com'));
  t.log('LINK: //www.invalid.com');

  t.falsy(validKey('www.invalid.com'));
  t.log('LINK: www.invalid.com');

  t.falsy(validKey('https://invalid.com'));
  t.log('LINK: https://invalid.com');

  t.falsy(validKey('https://www.invalid.com'));
  t.log('LINK: https://www.invalid.com');

  t.falsy(validKey('http://invalid.com'));
  t.log('LINK: http://invalid.com');

  t.falsy(validKey('http://www.invalid.com'));
  t.log('LINK: http://www.invalid.com');

  t.pass();

});

test('parseKey tests including origin', t => {

  t.deepEqual(parseKey('http://www.brixtol.com'), { pathname: '/', hash: '', search: '' });
  t.log('LINK: http://www.brixtol.com');

  t.deepEqual(parseKey('www.brixtol.com/foo'), { pathname: '/foo', hash: '', search: '' });
  t.log('LINK: www.brixtol.com/foo');

  t.deepEqual(parseKey('//brixtol.com/foo?param=bar'), { pathname: '/foo', search: '?param=bar', hash: '' });
  t.log('LINK: //brixtol.com/foo?param=bar');

  t.deepEqual(parseKey('//brixtol.com/foo?p=b#h'), { pathname: '/foo', search: '?p=b', hash: '#h' });
  t.log('LINK: //brixtol.com/foo?p=b#');

  t.deepEqual(parseKey('//brixtol.com/foo#hash'), { pathname: '/foo', search: '', hash: '#hash' });
  t.log('LINK: //brixtol.com/foo#hash');

  t.deepEqual(parseKey('//brixtol.com#hash'), { pathname: '/', search: '', hash: '#hash' });
  t.log('LINK: //brixtol.com#hash');

  t.deepEqual(parseKey('//brixtol.com?param=bar'), { pathname: '/', search: '?param=bar', hash: '' });
  t.log('LINK: //brixtol.com?param=bar');

  t.pass();

});

test('parseKey tests pathname only', t => {

  t.deepEqual(parseKey('/'), { pathname: '/', hash: '', search: '' });
  t.log('PATH: /');

  t.deepEqual(parseKey('/foo'), { pathname: '/foo', hash: '', search: '' });
  t.log('PATH: /foo');

  t.deepEqual(parseKey('/foo?param=bar'), { pathname: '/foo', search: '?param=bar', hash: '' });
  t.log('PATH: /foo?param=bar');

  t.deepEqual(parseKey('?param=bar#h'), { pathname: '/foo/bar', search: '?param=bar', hash: '#h' });
  t.log('PATH: /foo?param=bar#h');

  t.deepEqual(parseKey('/foo#hash'), { pathname: '/foo', search: '', hash: '#hash' });
  t.log('PATH: /foo#hash');

  t.deepEqual(parseKey('/#hash'), { pathname: '/', search: '', hash: '#hash' });
  t.log('PATH: /#hash');

});

test('getAttributes tests hover annotated attributes', t => {

  const a = document.createElement('a');
  const expects = {
    key: '/foo/bar?param=baz',
    rev: '/foo/bar',
    threshold: 250,
    location: {
      hash: '',
      hostname: 'brixtol.com',
      origin: 'https://brixtol.com',
      pathname: '/foo/bar',
      search: '?param=baz'
    }
  };

  a.setAttribute('href', '/foo/bar?param=baz');

  t.log('NODE: <a data-spx-threshold="250"></a>');
  a.setAttribute('data-spx-threshold', '250');

  t.deepEqual(getAttributes(a), expects); // RESULT

  t.log('NODE: <a data-spx-threshold="250" data-spx-hover="true"></a>');
  a.setAttribute('data-spx-hover', 'true');

  t.deepEqual(getAttributes(a), expects); // RESULT

  t.log('NODE: <a data-spx-threshold="250" data-spx-hover="false"></a>');
  a.setAttribute('data-spx-hover', 'false');

  t.deepEqual(getAttributes(a), expects); // RESULT
  // t.log({ threshold: 250 });

});

test('getAttributes tests proximity annotated attributes', t => {

  const a = document.createElement('a');
  const expects = {
    key: '/foo/bar?param=baz',
    rev: '/foo/bar',
    threshold: 250,
    proximity: 100,
    location: {
      hash: '',
      hostname: 'brixtol.com',
      origin: 'https://brixtol.com',
      pathname: '/foo/bar',
      search: '?param=baz'
    }
  };

  a.setAttribute('href', '/foo/bar?param=baz');

  /* FIRST TEST --------------------------------- */

  t.log('NODE: <a data-spx-proximity="100" data-spx-threshold="250"></a>');

  a.setAttribute('data-spx-threshold', '250');
  a.setAttribute('data-spx-proximity', '100');

  t.deepEqual(getAttributes(a), expects); // RESULT
  // t.log({ proximity: 100, threshold: 250 });

  /* SECOND TEST -------------------------------- */

  t.log('NODE: <a data-spx-threshold="300" data-spx-proximity="true"></a>');

  a.setAttribute('data-spx-proximity', 'true');
  a.setAttribute('data-spx-threshold', '300');

  delete expects.proximity;
  expects.threshold = 300;

  t.deepEqual(getAttributes(a), expects); // RESULT
  // t.log({ threshold: 300 });

  /* THIRD TEST --------------------------------- */

  t.log('NODE: <a data-spx-threshold="250" data-spx-proximity="false"></a>');
  a.setAttribute('data-spx-proximity', 'false');
  a.setAttribute('data-spx-threshold', '100');

  expects.threshold = 100;

  t.deepEqual(getAttributes(a), expects); // RESULT
  // t.log({ threshold: 100 });

});

test('getAttributes tests append/prepend annotated attributes', t => {

  const a = document.createElement('a');
  const expects = {
    key: '/foo/bar?param=baz',
    rev: '/foo/bar',
    append: [ [ '.parent', '.child' ] ],
    location: {
      hash: '',
      hostname: 'brixtol.com',
      origin: 'https://brixtol.com',
      pathname: '/foo/bar',
      search: '?param=baz'
    }
  };

  a.setAttribute('href', '/foo/bar?param=baz');

  /* FIRST TEST --------------------------------- */

  t.log('NODE: <a data-spx-append="([".parent", ".child"])"></a>');
  a.setAttribute('data-spx-append', '([".parent", ".child"])');

  t.deepEqual(getAttributes(a), expects); // RESULT
  // t.log(expects.append);

  /* SECOND TEST -------------------------------- */

  expects.append.push(([ '#parent', '#child' ]));

  t.log('NODE: <a data-spx-append="([".parent", ".child"], ["#parent", "#child"])"></a>');
  a.setAttribute('data-spx-append', '([".parent", ".child"],["#parent", "#child"])');

  t.deepEqual(getAttributes(a), expects); // RESULT
  // t.log(expects.append);

  /* SECOND TEST -------------------------------- */

  expects.append = [ [ '.a', '.b' ], [ '.c', '.d' ], [ '.e', '.f' ] ];

  t.log('NODE: <a data-spx-append="([".a",".b"],[".c",".d"],[".e",".f"])"></a>');
  a.setAttribute('data-spx-append', '([".a",".b"],[".c",".d"],[".e",".f"])');

  t.deepEqual(getAttributes(a), expects); // RESULT
  // t.log(expects.append);

  /* SECOND TEST -------------------------------- */

  expects.prepend = [ [ '.p1', '.p2' ], [ '.p3', '.p4' ] ];

  t.log('NODE: <a data-spx-prepend="([".p1",".p2"],[".p3",".p4"])"></a>');
  a.setAttribute('data-spx-prepend', '([".p1",".p2"],[".p3",".p4"])');

  t.deepEqual(getAttributes(a), expects); // RESULT
  // t.log(expects.prepend);

});

test('getAttributes tests position annotated attributes', t => {

  const a = document.createElement('a');
  const expects = {
    key: '/foo/bar?param=baz',
    rev: '/foo/bar',
    position: { x: 100, y: 1000 },
    location: {
      hash: '',
      hostname: 'brixtol.com',
      origin: 'https://brixtol.com',
      pathname: '/foo/bar',
      search: '?param=baz'
    }
  };

  a.setAttribute('href', '/foo/bar?param=baz');

  t.log('NODE: <a data-spx-position="x:100 y:1000"></a>');
  a.setAttribute('data-spx-position', 'x:100 y:1000');

  t.deepEqual(getAttributes(a), expects); // RESULT
  // t.log(expects.position);

});
