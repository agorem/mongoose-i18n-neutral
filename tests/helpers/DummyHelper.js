const mongoose = require('mongoose');

const DummyHelper = {
  getI18nValidModel(modelName) {
    const schema = new mongoose.Schema({
      name: {
        type: String,
        i18n: true
      }
    });
    return mongoose.model(modelName, schema);
  },
  getI18nInvalidModel(modelName) {
    const schema = new mongoose.Schema({
      name: {
        type: Number,
        i18n: true
      }
    });
    return mongoose.model(modelName, schema);
  }
};

module.exports = DummyHelper;
