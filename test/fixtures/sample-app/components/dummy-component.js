module.exports = function (app, options, next) {
  app.dummyComponentOptions = options;
  next();
};
