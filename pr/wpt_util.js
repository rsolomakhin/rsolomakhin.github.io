'use strict';

// Fake implementations of various functions that WPT code might require.

function assert_true(a, msg) {
  msg = (msg === undefined) ? 'assert_true failed' : msg;
  if (!a) {
    error(msg);
  }
}

function assert_equals(a, b, msg) {
  msg = (msg === undefined) ? 'assert_equals failed' : msg;
  if (a !== b) {
    error(msg);
  }
}

function assert_not_equals(a, b, msg) {
  msg = (msg === undefined) ? 'assert_not_equals failed' : msg;
  if (a === b) {
    error(msg);
  }
}

function assert_unreached(msg) {
  msg = (msg === undefined) ? 'assert_unreached failed' : msg;
  error(msg);
}

function assert_greater_than_equals(a, b, msg) {
  msg = (msg === undefined) ? 'assert_greater_than_equals failed' : msg;

  if (a < b) {
    error(msg);
  }
}
