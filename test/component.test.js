'use strict';
var t = require('chai').assert;
var bootable = require('bootable');
var componentPhase = require('../');

describe('bootable-component', function () {
  it('configures components', function () {
    var app = {};
    var owner = { app: app };
    var initializer = new bootable.Initializer();
    initializer.phase(componentPhase(__dirname + '/fixtures/sample-app'));
    initializer.run(function (err) {
      if (err) { throw err; }
    }, owner);

    t.equal(app.dummyComponentOptions.option, 'hello');

  });
});
