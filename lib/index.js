var debug = require('debug')('bootable:components');
var path = require('path');
var configup = require('configup');
var middist = require('middist');

/**
 *
 * @param dir the relative or absolute dir where is the components config file. default is `config`.
 * @returns {Function}
 */
module.exports = function (dir) {
  return function components(done) { // phase name is important for eventable
    var app = this.app;
    var rootDir = path.resolve(this.root || process.cwd(), dir || '');
    var config = loadComponents(rootDir);
    var componentInstructions = buildComponentInstructions(rootDir, config);
    if (componentInstructions.length > 0) {
      setupComponents(app, componentInstructions, done);
    } else {
      done();
    }
  };
};

function loadComponents(dir, env) {
  return configup.load(path.resolve(dir, 'components'), env, mergeComponentConfig);
}

function mergeComponentConfig(target, config, fileName) {
  for (var c in target) {
    var err = configup.mergeObjects(target[c], config[c]);
    if (err) {
      throw new Error('Cannot apply ' + fileName + ' to `' + c + '`: ' + err);
    }
  }
}

function buildComponentInstructions(rootDir, config) {
  return Object.keys(config)
    .filter(function (name) {
      return !!config[name];
    })
    .map(function (name) {
      return {
        sourceFile: configup.resolveAppScriptPath(rootDir, name, {strict: true}),
        config: config[name]
      };
    });
}

var handle = middist.build(function (item, app, next) {
  debug('Configuring component %j', item.sourceFile);
  var configFn = require(item.sourceFile);
  if (configFn.length > 2) {
    configFn(app, item.config, next);
  } else {
    configFn(app, item.config);
    next();
  }
});

function setupComponents(app, instructions, done) {
  handle(instructions, app, done);
}
