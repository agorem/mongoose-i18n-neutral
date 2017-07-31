var mongoose = require('mongoose');

var DummyHelper = {
  getI18nValidModel: function (modelName) {
    var schema = new mongoose.Schema({
      name: {
        type: String,
        i18n: true
      }
    });
    return mongoose.model(modelName,schema);
  },
  getI18nInvalidModel: function (modelName) {
    var schema = new mongoose.Schema({
      name: {
        type: Number,
        i18n: true
      }
    });
    return mongoose.model(modelName,schema);
  }
};

module.exports = DummyHelper;