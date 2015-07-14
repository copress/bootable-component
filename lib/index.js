var debug = require('debug')('bootable-component');
var path = require('path');
var configup = require('configup');

/**
 *
 * @param dir the relative or absolute dir where is the components config file. default is `config`.
 * @returns {Function}
 */
module.exports = function (dir) {
  return function () {
    var app = this.app;
    var rootDir = path.resolve(this.root || process.cwd(), dir || '');
    var config = loadComponents(rootDir);
    var componentInstructions = buildComponentInstructions(rootDir, config);
    setupComponents(app, componentInstructions);
  }
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

function setupComponents(app, instructions) {
  instructions.forEach(function (data) {
    debug('Configuring component %j', data.sourceFile);
    var configFn = require(data.sourceFile);
    configFn(app, data.config);
  });
}
